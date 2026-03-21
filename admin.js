/* --- ADMIN DASHBOARD LOGIC --- */

// --- GLOBAL STATE ---
let mapInstance = null;
let kmlLayer = null;
let farmerChartInstance = null;

// 1. AUTHENTICATION CHECK
(function checkAuth() {
    const userJson = localStorage.getItem('agriFlowUser');
    const overlay = document.getElementById('auth-check-overlay');
    
    if (!userJson) {
        window.location.href = 'index.html';
        return;
    }

    const user = JSON.parse(userJson);
    if (user.role !== 'admin') {
        alert("Access Denied: Administrator privileges required.");
        window.location.href = 'index.html';
        return;
    }

    // Auth Passed
    setTimeout(() => {
        if(overlay) overlay.style.display = 'none';
        initDashboard(); // Start systems
    }, 800);
})();

function logoutAdmin() {
    if(confirm("End admin session?")) {
        localStorage.removeItem('agriFlowUser');
        if (window.API) API.auth.logout();
        window.location.href = 'index.html';
    }
}

// 2. INITIALIZATION
function initDashboard() {
    renderSystemAlerts();
    renderFarmerDashboard();
    // Default load
    // loadDataset('vegetables'); // Not calling immediately to keep dashboard clean
}

// 3. NAVIGATION SYSTEM
function switchSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('section').forEach(sec => sec.classList.add('hidden'));
    
    // Show selected
    document.getElementById('sec-' + sectionId).classList.remove('hidden');

    // Update Sidebar
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick').includes(sectionId)) btn.classList.add('active');
    });

    // Header Updates
    const titles = {
        'dashboard': 'Dashboard Overview',
        'csv-upload': 'Advanced Data Import',
        'kml-upload': 'GIS Boundary Manager',
        'manage-data': 'Master Record System',
        'farmers': 'Farmer Management Console',
        'page-settings': 'Content Manager',
        'alerts': 'System Notifications'
    };
    document.getElementById('page-title').innerText = titles[sectionId] || 'Admin';

    // Specific Init Logic
    if(sectionId === 'kml-upload') setTimeout(initKMLMap, 200); // Wait for visibility
    if(sectionId === 'manage-data') loadDataset(document.getElementById('dataset-select').value);
    if(sectionId === 'page-settings') loadPageSettings();
}

// 4. KML / GIS SYSTEM
function initKMLMap() {
    if(mapInstance) {
        mapInstance.invalidateSize();
        return;
    }
    // Initialize Leaflet
    mapInstance = L.map('kml-map').setView([7.8731, 80.7718], 7);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap'
    }).addTo(mapInstance);
    kmlLayer = L.geoJSON(null, {
        style: { color: "#F97316", weight: 2, fillOpacity: 0.1 }
    }).addTo(mapInstance);
}

function handleKMLUpload() {
    const fileInput = document.getElementById('kml-file-input');
    const file = fileInput.files[0];
    if(!file) { alert("Please select a .kml file"); return; }

    const reader = new FileReader();
    reader.onload = function(e) {
        const parser = new DOMParser();
        const kmlDoc = parser.parseFromString(e.target.result, 'text/xml');
        // toGeoJSON is a CDN global from @mapbox/togeojson loaded in admin.html
        // eslint-disable-next-line no-undef
        const geojson = /** @type {any} */ (window.toGeoJSON).kml(kmlDoc);

        // Update Stats
        const features = geojson.features.length;
        document.getElementById('kml-poly-count').innerText = features;
        document.getElementById('kml-size').innerText = (file.size / 1024).toFixed(2) + " KB";
        document.getElementById('kml-stats').classList.remove('hidden');

        // Render Map
        kmlLayer.clearLayers();
        kmlLayer.addData(geojson);
        mapInstance.fitBounds(kmlLayer.getBounds());
    };
    reader.readAsText(file);
}

function saveKMLToDatabase() {
    const type = document.getElementById('kml-type-select').value;
    // Backend Callback
    console.log(`Saving KML data for ${type}...`);
    alert(`Successfully updated ${type.toUpperCase()} boundaries in the GIS database.`);
}

// 5. ENHANCED CSV SYSTEM
function processCSV() {
    const fileInput = document.getElementById('csv-file-input');
    const file = fileInput.files[0];
    const type = document.getElementById('csv-type-select').value;

    if (!file) { alert("Please select a CSV file."); return; }

    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            validateCSVData(results.data, type);
        }
    });
}

function validateCSVData(rows, type) {
    const table = document.getElementById('csv-preview-table');
    document.getElementById('csv-preview-container').classList.remove('hidden');
    document.getElementById('csv-warning-panel').classList.add('hidden');

    if (rows.length === 0) return;

    // Define Expected Schemas
    const schemas = {
        'vegetables': ['Name', 'Price', 'Location'],
        'fruits': ['Name', 'Stock', 'Location'],
        'farmers': ['Name', 'NIC', 'District'],
        'weather': ['Date', 'Temp', 'Rainfall']
    };

    const headers = Object.keys(rows[0]);
    const expected = schemas[type] || [];
    
    // Auto-Map & Check Headers
    const missing = expected.filter(col => !headers.includes(col));
    if(missing.length > 0) {
        document.getElementById('csv-warning-panel').classList.remove('hidden');
        document.getElementById('csv-warning-text').innerText = `Missing expected columns: ${missing.join(', ')}. Please map them manually or check the file.`;
    }

    // Render Preview
    let html = `<thead class="bg-gray-100 font-bold text-gray-600"><tr>`;
    headers.forEach(h => html += `<th class="px-4 py-2">${h}</th>`);
    html += `</tr></thead><tbody>`;

    rows.slice(0, 10).forEach(row => {
        // Simple Validation: Check for empty required fields
        const isInvalid = expected.some(k => !row[k]);
        const bgClass = isInvalid ? 'bg-red-50 text-red-700' : 'bg-white hover:bg-gray-50';
        
        html += `<tr class="${bgClass}">`;
        headers.forEach(h => html += `<td class="px-4 py-2 border-b border-gray-100">${row[h]}</td>`);
        html += `</tr>`;
    });
    html += `</tbody>`;
    table.innerHTML = html;
}

function clearCSV() {
    document.getElementById('csv-file-input').value = "";
    document.getElementById('csv-preview-container').classList.add('hidden');
    document.getElementById('csv-warning-panel').classList.add('hidden');
}

function saveCSVToDb() {
    alert("Batch import successful! Database updated.");
    clearCSV();
}

// 6. FARMER MANAGEMENT SYSTEM
const farmersDb = [
    { id: 101, name: "Kamal Perera", nic: "852341234V", dist: "Nuwara Eliya", status: "Active", regDate: "2023-10-12" },
    { id: 102, name: "Saman Silva", nic: "901231234V", dist: "Anuradhapura", status: "Pending", regDate: "2023-10-15" },
    { id: 103, name: "Nimali Dias", nic: "928371234V", dist: "Gampaha", status: "Suspended", regDate: "2023-09-01" },
    { id: 104, name: "Raja Bandara", nic: "781231234V", dist: "Kandy", status: "Active", regDate: "2023-11-05" }
];

function renderFarmerDashboard() {
    // Use the API-aware version from admin-patch.js if available,
    // otherwise fall back to the static legacy version.
    if (typeof window.renderFarmerTable === 'function') {
        window.renderFarmerTable();
    } else {
        _renderFarmerTableLegacy(farmersDb);
    }
    renderLoginLogs();
    initFarmerCharts();
}

// Renamed to avoid overwriting admin-patch.js's API-aware window.renderFarmerTable
function _renderFarmerTableLegacy(data) {
    const tbody = document.getElementById('farmer-tbody');
    tbody.innerHTML = '';
    
    data.forEach(f => {
        let badgeClass = f.status === 'Active' ? 'badge-active' : (f.status === 'Pending' ? 'badge-pending' : 'badge-suspended');
        
        tbody.innerHTML += `
            <tr class="hover:bg-gray-50 border-b border-gray-100 transition">
                <td class="px-4 py-3">
                    <div class="font-bold text-gray-800">${f.name}</div>
                    <div class="text-[10px] text-gray-500">${f.nic}</div>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600">${f.dist}</td>
                <td class="px-4 py-3"><span class="badge ${badgeClass}">${f.status}</span></td>
                <td class="px-4 py-3 text-right">
                    <button onclick="approveFarmer(${f.id})" title="Approve" class="text-green-500 hover:bg-green-50 p-1.5 rounded"><i class="fas fa-check"></i></button>
                    <button onclick="suspendFarmer(${f.id})" title="Suspend" class="text-orange-500 hover:bg-orange-50 p-1.5 rounded"><i class="fas fa-ban"></i></button>
                    <button onclick="deleteFarmer(${f.id})" title="Delete" class="text-red-500 hover:bg-red-50 p-1.5 rounded"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
}

function filterFarmers(status) {
    if (typeof window.renderFarmerTable === 'function') {
        // admin-patch.js API-aware version — pass the status as a filter
        window.renderFarmerTable('', status === 'all' ? '' : status);
    } else {
        if (status === 'all') _renderFarmerTableLegacy(farmersDb);
        else _renderFarmerTableLegacy(farmersDb.filter(f => f.status.toLowerCase() === status));
    }
}

function approveFarmer(id) { 
    if(confirm("Approve this farmer account?")) { alert("Farmer " + id + " Approved."); /* backend call */ } 
}
function suspendFarmer(id) { 
    if(confirm("Suspend this farmer account?")) { alert("Farmer " + id + " Suspended."); /* backend call */ } 
}
function deleteFarmer(id) { 
    if(confirm("Permanently delete this farmer?")) { alert("Farmer " + id + " Deleted."); /* backend call */ } 
}

function renderLoginLogs() {
    const logs = document.getElementById('login-logs');
    logs.innerHTML = '';
    const mockLogs = [
        { name: "Kamal Perera", time: "10 mins ago", ip: "192.168.1.1", status: "Success" },
        { name: "Saman Silva", time: "2 hours ago", ip: "10.0.0.5", status: "Failed (Wrong Pass)" },
        { name: "Raja Bandara", time: "1 day ago", ip: "172.16.0.2", status: "Success" }
    ];
    
    mockLogs.forEach(l => {
        const icon = l.status === "Success" ? "fa-check-circle text-green-500" : "fa-times-circle text-red-500";
        logs.innerHTML += `
            <div class="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                <div>
                    <div class="font-bold text-gray-700">${l.name}</div>
                    <div class="text-[10px] text-gray-400">${l.ip} • ${l.time}</div>
                </div>
                <div class="text-xs font-bold text-gray-500 flex items-center gap-1"><i class="fas ${icon}"></i> ${l.status}</div>
            </div>
        `;
    });
}

function initFarmerCharts() {
    const ctx = document.getElementById('farmerChart');
    if(farmerChartInstance) farmerChartInstance.destroy();
    
    farmerChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Active', 'Pending', 'Suspended'],
            datasets: [{
                data: [65, 25, 10],
                backgroundColor: ['#10B981', '#F97316', '#EF4444'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'right' } }
        }
    });
}

// 7. DYNAMIC FORM GENERATION & CRUD
// Mock data schema
const schemas = {
    vegetables: { Name: 'text', Price: 'number', Stock: 'number', Province: 'select', Image: 'file' },
    fruits: { Name: 'text', Type: 'select', Price: 'number', Export_Grade: 'boolean' },
    weather: { Date: 'date', Province: 'select', Temperature: 'number', Rainfall: 'number' },
    farmers: { Full_Name: 'text', NIC: 'text', District: 'select', Photo: 'file' }
};

let currentCrudType = 'vegetables';
let currentCrudId = null;

function loadDataset(type) {
    currentCrudType = type;
    const tbody = document.getElementById('crud-tbody');
    const thead = document.querySelector('#crud-table thead');
    
    // Generate Headers
    const fields = Object.keys(schemas[type] || schemas['vegetables']);
    let headHtml = `<tr>`;
    fields.forEach(f => headHtml += `<th class="px-4 py-3">${f.replace('_', ' ')}</th>`);
    headHtml += `<th class="px-4 py-3 text-right">Actions</th></tr>`;
    thead.innerHTML = headHtml;

    // Mock Row
    let rowHtml = `<tr class="border-b border-gray-100 hover:bg-gray-50">`;
    fields.forEach(() => rowHtml += `<td class="px-4 py-3 text-gray-600">--</td>`);
    rowHtml += `<td class="px-4 py-3 text-right">
        <button onclick="openRecordModal('edit', 99)" class="text-blue-500 hover:bg-blue-50 p-1 rounded mr-1"><i class="fas fa-edit"></i></button>
        <button class="text-red-500 hover:bg-red-50 p-1 rounded"><i class="fas fa-trash"></i></button>
    </td></tr>`;
    tbody.innerHTML = rowHtml; // Just 1 mock row for demo
    document.getElementById('record-count').innerText = "Showing 1 mock record";
}

function openRecordModal(mode, id) {
    const modal = document.getElementById('crud-modal');
    const container = document.getElementById('crud-form-container');
    const title = document.getElementById('modal-title');
    currentCrudId = id;
    
    title.innerText = mode === 'add' ? `Add ${currentCrudType}` : `Edit ${currentCrudType}`;
    container.innerHTML = '';
    
    // Auto-Generate Fields
    const fields = schemas[currentCrudType] || schemas['vegetables'];
    
    for (const [key, type] of Object.entries(fields)) {
        let inputHtml = '';
        if (type === 'text' || type === 'number' || type === 'date') {
            inputHtml = `<input type="${type}" class="w-full p-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500" placeholder="${key}">`;
        } else if (type === 'select') {
            inputHtml = `<select class="w-full p-3 rounded-xl border border-gray-200 text-sm"><option>Select ${key}</option><option>Option A</option><option>Option B</option></select>`;
        } else if (type === 'file') {
            inputHtml = `<input type="file" class="w-full text-xs text-gray-500">`;
        } else if (type === 'boolean') {
            inputHtml = `<div class="flex items-center"><input type="checkbox" class="w-4 h-4 text-blue-600 rounded"> <span class="ml-2 text-sm text-gray-600">Yes/No</span></div>`;
        }
        
        container.innerHTML += `<div><label class="block text-xs font-bold text-gray-500 uppercase mb-1">${key.replace('_', ' ')}</label>${inputHtml}</div>`;
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => {
        document.getElementById('crud-modal-content').classList.remove('scale-95', 'opacity-0');
        document.getElementById('crud-modal-content').classList.add('scale-100', 'opacity-100');
    }, 10);
}

function closeRecordModal() {
    document.getElementById('crud-modal-content').classList.remove('scale-100', 'opacity-100');
    document.getElementById('crud-modal-content').classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        document.getElementById('crud-modal').classList.add('hidden');
        document.getElementById('crud-modal').classList.remove('flex');
    }, 300);
}

function saveRecord() {
    alert("Record saved to database!");
    closeRecordModal();
}

// 8. SYSTEM ALERTS
function renderSystemAlerts() {
    const container = document.getElementById('alerts-container');
    const navCount = document.getElementById('nav-alert-count');
    
    const alerts = [
        { type: 'critical', title: 'Database Sync Error', msg: 'Failed to sync with Nuwara Eliya node.', time: '10 min ago' },
        { type: 'warning', title: 'High Traffic Load', msg: 'Server load at 85%.', time: '1 hour ago' },
        { type: 'info', title: 'New Registration', msg: 'Farmer ID #992 joined from Kandy.', time: '2 hours ago' }
    ];
    
    container.innerHTML = '';
    alerts.forEach(a => {
        container.innerHTML += `
            <div class="alert-item ${a.type}">
                <div class="flex justify-between">
                    <h5 class="font-bold text-gray-800 text-sm">${a.title}</h5>
                    <span class="text-[10px] text-gray-400">${a.time}</span>
                </div>
                <p class="text-xs text-gray-500 mt-1">${a.msg}</p>
            </div>
        `;
    });
    navCount.innerText = alerts.length;
}

// 9. PAGE SETTINGS (Keep existing logic)
const pages = [
    { id: 'p1', name: 'Home Page', desc: 'Main dashboard landing' },
    { id: 'p2', name: 'Map Interface', desc: 'GIS Visualization' }
];
function loadPageSettings() {
    const grid = document.getElementById('pages-grid');
    grid.innerHTML = '';
    pages.forEach(p => {
        grid.innerHTML += `<div class="glass-card p-5 rounded-2xl border border-white"><h4 class="font-bold">${p.name}</h4><p class="text-xs text-gray-500">${p.desc}</p><button class="mt-2 text-xs bg-gray-800 text-white px-2 py-1 rounded">Edit Content</button></div>`;
    });
}