// --- NAVIGATION ---
window.nav = function(page) {
    if (page === 'home') window.location.href = 'index.html';
    else if (page === 'map') window.location.href = 'map.html';
    else if (page === 'market') window.location.href = 'marketplace.html';
    else if (page === 'farmer') window.location.href = 'farmer.html';
};

// --- AUTH & STATE ---
let currentUser = null;

window.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('agriFlowUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateAuthUI();
    }
});

function updateAuthUI() {
    const btn = document.getElementById('auth-btn');
    if (currentUser) {
        let icon = 'fa-user'; let color = 'text-blue-600'; let bg = 'bg-blue-50';
        if (currentUser.role === 'farmer') { icon = 'fa-tractor'; color = 'text-orange-600'; bg = 'bg-orange-50'; }
        if (currentUser.role === 'admin') { icon = 'fa-user-shield'; color = 'text-red-600'; bg = 'bg-red-50'; }
        btn.innerHTML = `<i class="fas ${icon} ${color}"></i> <span class="${color}">${currentUser.name}</span>`;
        btn.className = `px-5 py-2 rounded-full ${bg} text-xs font-bold uppercase tracking-wide border border-gray-200 flex items-center gap-2`;
        btn.onclick = logout;
    } else {
        btn.innerHTML = `<i class="fas fa-user-circle text-lg"></i> <span>Login</span>`;
        btn.className = `px-5 py-2 rounded-full bg-white/80 text-blue-600 text-xs font-bold uppercase tracking-wide hover:bg-white hover:shadow-md transition border border-blue-100 flex items-center gap-2`;
        btn.onclick = () => openLoginModal();
    }
}

function logout() {
    if(confirm("Are you sure you want to logout?")) {
        localStorage.removeItem('agriFlowUser');
        currentUser = null;
        updateAuthUI();
        window.location.reload();
    }
}

// --- AUTH FUNCTIONS ---
window.openLoginModal = function(targetRole = null) {
    const modal = document.getElementById('auth-modal');
    const content = document.getElementById('auth-modal-content');
    modal.classList.remove('hidden'); modal.classList.add('flex');
    setTimeout(() => { content.classList.remove('scale-95', 'opacity-0'); content.classList.add('scale-100', 'opacity-100'); }, 10);
    if (targetRole) { selectRole(targetRole); } else { resetModal(); }
};

window.closeLoginModal = function() {
    const modal = document.getElementById('auth-modal');
    const content = document.getElementById('auth-modal-content');
    content.classList.remove('scale-100', 'opacity-100'); content.classList.add('scale-95', 'opacity-0');
    setTimeout(() => { modal.classList.add('hidden'); modal.classList.remove('flex'); }, 300);
};

window.resetModal = function() {
    document.getElementById('step-role').classList.remove('hidden');
    document.getElementById('step-farmer').classList.add('hidden');
    document.getElementById('step-customer').classList.add('hidden');
    document.getElementById('step-admin').classList.add('hidden');
    document.getElementById('modal-title').innerText = "Login to AgriFlow";
};

window.selectRole = function(role) {
    document.getElementById('step-role').classList.add('hidden');
    if (role === 'farmer') {
        document.getElementById('step-farmer').classList.remove('hidden');
        document.getElementById('modal-title').innerText = "Farmer Registration";
    } else if (role === 'customer') {
        document.getElementById('step-customer').classList.remove('hidden');
        document.getElementById('modal-title').innerText = "Customer Registration";
        populateProvinces();
    } else if (role === 'admin') {
        document.getElementById('step-admin').classList.remove('hidden');
        document.getElementById('modal-title').innerText = "Admin Access";
    }
};

window.handleLogin = function(role) {
    let name = "";
    if (role === 'admin') {
        const u = document.getElementById('a-user').value;
        const p = document.getElementById('a-pass').value;
        if (u === 'admin' && p === 'admin123') { name = "Administrator"; } 
        else { alert("Invalid Credentials!"); return; }
    } else {
        const nameInput = role === 'farmer' ? document.getElementById('f-name') : document.getElementById('c-name');
        name = nameInput.value || (role === 'farmer' ? "Kamal Perera" : "Nimali Silva");
    }
    currentUser = { role: role, name: name };
    localStorage.setItem('agriFlowUser', JSON.stringify(currentUser));
    // Sync to backend + get JWT token
    if (window.API) {
      if (role === 'admin') {
        API.auth.login({ username: document.getElementById('a-user')?.value, password: document.getElementById('a-pass')?.value });
      } else {
        API.auth.login({ role, name });
      }
    } else if (window.AgriDB) {
      AgriDB.saveUser(currentUser);
    }
    updateAuthUI();
    closeLoginModal();
    alert(`Logged in as ${role.toUpperCase()}`);
};

window.handleRestrictedAction = function(actionName) {
    if (!currentUser) {
        alert(`Please login to ${actionName}.`);
        openLoginModal();
        return;
    }
    if (currentUser.role === 'admin') {
        if(actionName === 'Calculate') calculateProfit();
        if(actionName === 'Sell') alert("Admin Override: Opening Sell Form...");
        return;
    }
    if (currentUser.role !== 'farmer') {
        if(confirm(`Only Farmers (and Admins) can ${actionName}. Would you like to register as a Farmer?`)) {
            currentUser = null; 
            openLoginModal('farmer');
        }
    } else {
        if(actionName === 'Calculate') calculateProfit();
        if(actionName === 'Sell') alert("Opening Sell Form... (Mock)");
    }
};

window.populateProvinces = function() {
    const pSelect = document.getElementById('c-province');
    pSelect.innerHTML = '<option>Select Province</option>';
    provinces.forEach(p => { pSelect.innerHTML += `<option value="${p.id}">${p.name}</option>`; });
};
window.populateDistricts = function() { /* Simplified */ };

// --- NATIONAL OVERVIEW LOGIC ---
window.openNationalOverview = function() {
    const modal = document.getElementById('national-modal');
    const tbody = document.getElementById('nat-table-body');
    tbody.innerHTML = '';
    const categories = ['Paddy', 'Vegetables', 'Fruits', 'Tea', 'Spices'];
    let totalProd = 0;
    categories.forEach(cat => {
        const stock = Math.floor(Math.random() * 10000) + 5000; const yield = Math.floor(Math.random() * 15000) + 8000;
        const status = stock > yield ? 'Surplus' : (stock < 5000 ? 'Shortage' : 'Stable');
        const color = status === 'Surplus' ? 'text-orange-500' : (status === 'Shortage' ? 'text-red-500' : 'text-green-600');
        const trend = Math.random() > 0.5 ? '↗' : '↘';
        totalProd += stock;
        tbody.innerHTML += `<tr class="hover:bg-gray-50 transition"><td class="px-4 py-3 font-medium text-gray-700">${cat}</td><td class="px-4 py-3 text-right text-gray-600 font-mono">${stock.toLocaleString()}</td><td class="px-4 py-3 text-right text-gray-600 font-mono">${yield.toLocaleString()}</td><td class="px-4 py-3 text-center font-bold text-xs ${color}">${status.toUpperCase()}</td><td class="px-4 py-3 text-center text-gray-400 font-bold">${trend}</td></tr>`;
    });
    document.getElementById('nat-total-prod').innerText = (totalProd / 1000).toFixed(1) + "k MT";
    modal.classList.remove('hidden'); modal.classList.add('flex');
};
window.closeNationalOverview = function() { document.getElementById('national-modal').classList.add('hidden'); document.getElementById('national-modal').classList.remove('flex'); };

// --- EXPORT MARKET LOGIC ---
let exportChartInstance = null;
window.openExportMarket = function() {
    const modal = document.getElementById('export-modal'); modal.classList.remove('hidden'); modal.classList.add('flex');
    const select = document.getElementById('export-crop-select'); select.onchange = () => updateExportView(select.value);
    updateExportView('Pineapple');
};
function updateExportView(crop) {
    const data = exportData[crop]; if (!data) return;
    document.getElementById('export-hs-code').innerText = "HS Code: " + data.hs;
    document.getElementById('export-price').innerHTML = `${data.price} <span class="text-sm text-gray-400 font-normal">/ kg</span>`;
    document.getElementById('export-trend').innerText = data.trend;
    document.getElementById('export-demand').innerHTML = `${data.demand} <span class="text-sm text-gray-400 font-normal">MT</span>`;
    document.getElementById('export-season').innerText = data.season;
    const reqContainer = document.getElementById('export-requests'); reqContainer.innerHTML = '';
    data.buyers.forEach(b => {
        const colorClass = b.color === 'green' ? 'bg-green-100 text-green-700' : (b.color === 'blue' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700');
        reqContainer.innerHTML += `<div class="p-3 rounded-xl border border-gray-200 bg-gray-50 flex justify-between items-center"><div><p class="font-bold text-gray-800 text-sm">${b.name}</p><p class="text-xs text-gray-500">Looking for: ${b.item}</p></div><span class="${colorClass} text-[10px] font-bold px-2 py-1 rounded">${b.tag}</span></div>`;
    });
    const ctx = document.getElementById('exportChart').getContext('2d'); if(exportChartInstance) exportChartInstance.destroy();
    exportChartInstance = new Chart(ctx, { type: 'bar', data: { labels: data.countries, datasets: [{ label: 'Demand (MT)', data: data.volumes, backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6366F1'], borderRadius: 4 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } } });
}
window.closeExportMarket = function() { document.getElementById('export-modal').classList.add('hidden'); document.getElementById('export-modal').classList.remove('flex'); };

// --- CATEGORY DETAILS LOGIC ---
function getCategoryMockData(_category) { const baseFactor = Math.random() * 0.5 + 0.8; const provStats = provinces.map(p => ({ name: p.name, farmers: Math.floor(Math.random() * 5000 * baseFactor) + 1000, stock: Math.floor(Math.random() * 200 * baseFactor) + 50, yield: Math.floor(Math.random() * 300 * baseFactor) + 100, status: Math.random() > 0.5 ? 'Stable' : (Math.random() > 0.5 ? 'High' : 'Low') })); const totalStock = provStats.reduce((acc, curr) => acc + curr.stock, 0); const totalFarmers = provStats.reduce((acc, curr) => acc + curr.farmers, 0); const expectedYield = provStats.reduce((acc, curr) => acc + curr.yield, 0); return { totalStock, totalFarmers, expectedYield, provStats }; }
let categoryChartInstance = null;
window.showCategoryDetails = function(category) { 
    const modal = document.getElementById('category-modal'); const content = document.getElementById('category-modal-content'); content.classList.remove('scale-95', 'opacity-0'); content.classList.add('scale-100', 'opacity-100'); document.getElementById('cat-modal-title').innerText = category + " Insights"; const data = getCategoryMockData(category); document.getElementById('cat-total-stock').innerText = data.totalStock.toLocaleString() + " MT"; document.getElementById('cat-total-farmers').innerText = data.totalFarmers.toLocaleString(); document.getElementById('cat-expected-yield').innerText = data.expectedYield.toLocaleString() + " MT"; const tbody = document.getElementById('cat-table-body'); tbody.innerHTML = ''; data.provStats.forEach(p => { let color = p.status === 'High' ? 'text-green-600' : (p.status === 'Low' ? 'text-red-500' : 'text-blue-500'); tbody.innerHTML += `<tr class="hover:bg-gray-50 transition"><td class="px-4 py-3 font-medium text-gray-700">${p.name}</td><td class="px-4 py-3 text-right text-gray-600">${p.farmers.toLocaleString()}</td><td class="px-4 py-3 text-right text-gray-600 font-mono">${p.stock}</td><td class="px-4 py-3 text-right text-gray-600 font-mono">${p.yield}</td><td class="px-4 py-3 text-center font-bold text-xs ${color}">${p.status.toUpperCase()}</td></tr>`; }); const ctx = document.getElementById('categoryChart').getContext('2d'); if(categoryChartInstance) categoryChartInstance.destroy(); categoryChartInstance = new Chart(ctx, { type: 'bar', data: { labels: data.provStats.map(p => p.name.replace(' Province', '')), datasets: [{ label: 'Current Stock (MT)', data: data.provStats.map(p => p.stock), backgroundColor: '#3B82F6', borderRadius: 4 }, { label: 'Expected Yield (MT)', data: data.provStats.map(p => p.yield), backgroundColor: '#10B981', borderRadius: 4 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true } } } }); modal.classList.remove('hidden'); modal.classList.add('flex'); 
};
window.closeCategoryModal = function() { document.getElementById('category-modal').classList.add('hidden'); document.getElementById('category-modal').classList.remove('flex'); };

window.switchWeatherTab = function(tab) {
    document.querySelectorAll('.weather-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');
    document.getElementById('weather-view-daily').classList.add('hidden');
    document.getElementById('weather-view-weekly').classList.add('hidden');
    document.getElementById('weather-view-monthly').classList.add('hidden');
    document.getElementById('weather-view-' + tab).classList.remove('hidden');
    if(tab === 'weekly') {
        const grid = document.getElementById('weekly-forecast-grid');
        if(grid.innerHTML.trim() !== "") return;
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']; grid.innerHTML = '';
        days.forEach((d, i) => {
            const temp = 22 + Math.floor(Math.random() * 5); const icon = i % 3 === 0 ? '<i class="fas fa-cloud-rain text-blue-300"></i>' : '<i class="fas fa-sun text-yellow-400"></i>';
            grid.innerHTML += `<div class="bg-white/20 p-2 rounded-lg text-center backdrop-blur-sm border border-white/10"><p class="text-[10px] font-bold text-gray-600">${d}</p><div class="my-1 text-lg">${icon}</div><p class="text-xs font-bold text-gray-800">${temp}°</p></div>`;
        });
    }
};

// --- ANALYSIS ---
function openAnalysis(data) {
    document.getElementById('panel-empty').classList.add('hidden'); document.getElementById('panel-content').classList.remove('hidden'); document.getElementById('panel-content').classList.add('flex');
    document.getElementById('anl-name').innerText = data.name; document.getElementById('anl-type').innerText = data.type || "REGION"; document.getElementById('rec-grow').innerText = data.grow || "Analyzing..."; document.getElementById('rec-avoid').innerText = data.avoid || "Analyzing...";
}
window.closeAnalysis = function() {
    document.getElementById('panel-content').classList.add('hidden'); document.getElementById('panel-content').classList.remove('flex'); document.getElementById('panel-empty').classList.remove('hidden');
};

window.populateCalcDistricts = function() {
    const pid = document.getElementById('calc-province').value;
    const distSelect = document.getElementById('calc-district');
    const dsdSelect = document.getElementById('calc-dsd');
    distSelect.innerHTML = '<option>District</option>'; distSelect.disabled = true;
    dsdSelect.innerHTML = '<option>DSD</option>'; dsdSelect.disabled = true;
    if(districts[pid]) {
        districts[pid].forEach(d => { distSelect.innerHTML += `<option value="${d.id}">${d.name}</option>`; });
        distSelect.disabled = false;
    }
};
window.populateCalcDSDs = function() {
    const did = document.getElementById('calc-district').value;
    const dsdSelect = document.getElementById('calc-dsd');
    dsdSelect.innerHTML = '<option>DSD</option>'; dsdSelect.disabled = true;
    if(dsdRawData[did]) {
        dsdRawData[did].forEach(d => { dsdSelect.innerHTML += `<option value="${d}">${d}</option>`; });
        dsdSelect.disabled = false;
    }
};
window.calculateProfit = function() { 
    // Mock calculation logic
    const crop = document.getElementById('calc-crop').value;
    const acres = document.getElementById('calc-acres').value;
    if(!crop || !acres) { alert("Please fill all fields"); return; }
    
    document.getElementById('res-duration').innerText = "90 Days";
    document.getElementById('res-date').innerText = "Oct 24, 2025";
    document.getElementById('res-harvest').innerText = (acres * 4000).toLocaleString() + " kg";
    document.getElementById('res-income').innerText = "Rs " + (acres * 4000 * 150).toLocaleString();
    
    const verdict = document.getElementById('res-verdict');
    verdict.innerHTML = `<i class="fas fa-check-circle text-green-600 text-xl mt-0.5"></i><div><h4 class="font-bold text-green-800 text-sm">High Profit Potential</h4><p class="text-xs text-green-700 mt-1">Market demand expected to rise.</p></div>`;
    
    document.getElementById('calc-result').classList.remove('hidden');
    
    const ctx = document.getElementById('profitChart').getContext('2d');
    new Chart(ctx, { type: 'line', data: { labels: ['M1', 'M2', 'M3'], datasets: [{ label: 'Price Trend', data: [100, 120, 140], borderColor: '#10B981' }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } } });
};

// --- HELPERS ---
window.selectRegion = function(data, _type) {
    openAnalysis(data);
};

window.renderProvinceGrid = function() {
    const grid = document.getElementById('explorer-grid');
    grid.innerHTML = '';
    document.getElementById('bread-district').classList.add('hidden');
    document.getElementById('bread-icon-1').classList.add('hidden');
    document.getElementById('bread-dsd').classList.add('hidden');
    document.getElementById('bread-icon-2').classList.add('hidden');
    currentProvinceId = null;
    provinces.forEach(prov => grid.innerHTML += createCard(prov, 'province'));
};

window.renderDistrictGrid = function(provinceId) {
    const grid = document.getElementById('explorer-grid');
    grid.innerHTML = '';
    currentProvinceId = provinceId;
    document.getElementById('bread-icon-1').classList.remove('hidden');
    const distEl = document.getElementById('bread-district');
    distEl.classList.remove('hidden');
    distEl.innerText = provinces.find(p => p.id === provinceId).name;
    document.getElementById('bread-dsd').classList.add('hidden');
    document.getElementById('bread-icon-2').classList.add('hidden');
    const distList = districts[provinceId] || [];
    if(distList.length === 0) { grid.innerHTML = '<p class="text-gray-500 col-span-3 text-center">No data available.</p>'; return; }
    distList.forEach(dist => {
        dist.img = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=300&q=80";
        dist.supply = 'Medium'; dist.crop = 'Mixed';
        grid.innerHTML += createCard(dist, 'district');
    });
};

window.renderDSDList = function(districtId) {
    // Simplified DSD render
    alert("DSD Drilldown for " + districtId);
};

function createCard(data, type) {
    const harvest = Math.floor(Math.random() * 40) + 40;
    const drillDownAction = type === 'province' ? `renderDistrictGrid('${data.id}')` : `renderDSDList('${data.id}')`;
    const btnText = type === 'province' ? 'View Districts' : 'View Divisions';
    const safeData = JSON.stringify(data).replace(/"/g, "&quot;");
    return `<div class="glass bg-white rounded-xl overflow-hidden hover:shadow-xl transition group relative border border-white hover:border-orange-200"><div class="cursor-pointer" onclick='window.selectRegion(${safeData}, "${type}")'><div class="h-32 bg-gray-200 overflow-hidden relative"><img src="${data.img}" class="w-full h-full object-cover transition duration-500 group-hover:scale-110"><div class="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition"></div><div class="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-[10px] font-bold text-gray-600 uppercase tracking-wide shadow-sm">${type}</div></div><div class="p-4 pb-16"><h3 class="font-bold text-gray-800 text-lg mb-1">${data.name}</h3><p class="text-xs text-gray-500 mb-3 font-medium">Supply: <span class="font-bold text-green-600">${data.supply}</span> • Top Crop: ${data.crop}</p><div class="mb-2"><div class="flex justify-between text-[10px] text-gray-400 mb-1 font-bold uppercase"><span>Harvest</span><span>${harvest}%</span></div><div class="progress-bar"><div class="progress-fill bg-green-500" style="width: ${harvest}%"></div></div></div></div></div><div class="absolute bottom-3 right-3 left-3"><button onclick="${drillDownAction}; event.stopPropagation();" class="w-full bg-gray-50 hover:bg-orange-50 text-gray-600 hover:text-orange-600 text-xs font-bold py-2.5 rounded-lg transition border border-gray-200 shadow-sm flex items-center justify-center gap-2 group-hover:border-orange-200">${btnText} <i class="fas fa-arrow-right text-[10px]"></i></button></div></div>`;
}

// --- MAP LOGIC ---
let map;
window.initMap = function() {
    if(map) return;
    if(!document.getElementById('map-container')) return;
    map = L.map('map-container', { zoomControl: false }).setView([7.8731, 80.7718], 8);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map);
    L.control.zoom({ position: 'bottomleft' }).addTo(map);
};

window.switchMapView = function(mode) {
    const mapContainer = document.getElementById('map-view-container');
    const gridContainer = document.getElementById('grid-view-container');
    const btnMap = document.getElementById('toggle-map');
    const btnGrid = document.getElementById('toggle-grid');
    
    if (mode === 'map') {
        mapContainer.classList.remove('hidden');
        gridContainer.classList.add('hidden');
        btnMap.classList.add('bg-orange-500', 'text-white', 'shadow-md');
        btnMap.classList.remove('text-gray-600', 'hover:bg-white/60');
        btnGrid.classList.remove('bg-orange-500', 'text-white', 'shadow-md');
        btnGrid.classList.add('text-gray-600', 'hover:bg-white/60');
    } else {
        mapContainer.classList.add('hidden');
        gridContainer.classList.remove('hidden');
        gridContainer.classList.add('flex');
        btnGrid.classList.add('bg-orange-500', 'text-white', 'shadow-md');
        btnGrid.classList.remove('text-gray-600', 'hover:bg-white/60');
        btnMap.classList.remove('bg-orange-500', 'text-white', 'shadow-md');
        btnMap.classList.add('text-gray-600', 'hover:bg-white/60');
        renderProvinceGrid();
    }
};

window.toggleLayer = function(layer) {
    alert("Toggling layer: " + layer);
};

window.resetFilters = function() {
    document.querySelectorAll('#filter-container input[type="checkbox"]').forEach(el => el.checked = false);
    document.getElementById('filter-stable').checked = true;
};

// --- DATA ---
const provinces = [ { id: 'central', name: 'Central Province', img: 'https://images.unsplash.com/photo-1545562778-433df733db9b', supply: 'High', crop: 'Tea', risk: 'Low', harvest: 80 }, { id: 'eastern', name: 'Eastern Province', img: 'https://images.unsplash.com/photo-1596627789728-662241512347', supply: 'Medium', crop: 'Paddy', risk: 'Low', harvest: 60 }, { id: 'north_central', name: 'North Central', img: 'https://images.unsplash.com/photo-1597816760634-927d337d452f', supply: 'High', crop: 'Rice', risk: 'Low', harvest: 90 }, { id: 'north_western', name: 'North Western', img: 'https://images.unsplash.com/photo-1622396636133-74308d729e2f', supply: 'High', crop: 'Coconut', risk: 'Low', harvest: 75 }, { id: 'northern', name: 'Northern Province', img: 'https://images.unsplash.com/photo-1588669678393-2767c6999333', supply: 'Medium', crop: 'Onions', risk: 'Medium', harvest: 55 }, { id: 'sabaragamuwa', name: 'Sabaragamuwa', img: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449', supply: 'High', crop: 'Rubber', risk: 'Low', harvest: 70 }, { id: 'southern', name: 'Southern Province', img: 'https://images.unsplash.com/photo-1532598187460-98fe8826d1e2', supply: 'High', crop: 'Cinnamon', risk: 'Low', harvest: 85 }, { id: 'uva', name: 'Uva Province', img: 'https://images.unsplash.com/photo-1595237731773-630e23005477', supply: 'Medium', crop: 'Vegetables', risk: 'High', harvest: 40 }, { id: 'western', name: 'Western Province', img: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff', supply: 'Low', crop: 'Fruits', risk: 'Low', harvest: 30 } ];
const districts = { 'central': [{id:'kandy',name:'Kandy'},{id:'matale',name:'Matale'},{id:'nuwara_eliya',name:'Nuwara Eliya'}], 'eastern': [{id:'ampara',name:'Ampara'},{id:'batticaloa',name:'Batticaloa'},{id:'trincomalee',name:'Trincomalee'}], 'north_central': [{id:'anuradhapura',name:'Anuradhapura'},{id:'polonnaruwa',name:'Polonnaruwa'}], 'north_western': [{id:'kurunegala',name:'Kurunegala'},{id:'puttalam',name:'Puttalam'}], 'northern': [{id:'jaffna',name:'Jaffna'},{id:'kilinochchi',name:'Kilinochchi'},{id:'mullaitivu',name:'Mullaitivu'},{id:'mannar',name:'Mannar'},{id:'vavuniya',name:'Vavuniya'}], 'sabaragamuwa': [{id:'kegalle',name:'Kegalle'},{id:'ratnapura',name:'Ratnapura'}], 'southern': [{id:'galle',name:'Galle'},{id:'matara',name:'Matara'},{id:'hambantota',name:'Hambantota'}], 'uva': [{id:'badulla',name:'Badulla'},{id:'monaragala',name:'Monaragala'}], 'western': [{id:'colombo',name:'Colombo'},{id:'gampaha',name:'Gampaha'},{id:'kalutara',name:'Kalutara'}] };
const dsdRawData = { 'ampara': ["Addalachchenai","Akkaraipattu","Ampara","Damana","Dehiattakandiya"], 'anuradhapura': ["Galnewa","Horowpothana","Kebithigollewa","Kekirawa","Mihinthale"], 'badulla': ["Badulla","Bandarawela","Ella","Hali-Ela","Haputale"], 'colombo': ["Colombo","Dehiwala","Homagama","Kaduwela"], 'galle': ["Akmeemana","Ambalangoda","Baddegama","Galle"], 'gampaha': ["Attanagalla","Biyagama","Divulapitiya","Gampaha"], 'hambantota': ["Ambalantota","Beliatta","Hambantota"], 'jaffna': ["Chankanai","Chavakachcheri","Jaffna"], 'kalutara': ["Agalawatta","Bandaragama","Kalutara"], 'kandy': ["Akurana","Delthota","Kandy","Kundasale"], 'kegalle': ["Aranayaka","Bulathkohupitiya","Kegalle"], 'kurunegala': ["Alawwa","Bingiriya","Kurunegala"], 'matale': ["Dambulla","Galewela","Matale"], 'matara': ["Akuressa","Devinuwara","Matara"], 'monaragala': ["Badalkumbura","Bibile","Moneragala"], 'nuwara_eliya': ["Ambagamuwa","Hanguranketha","Nuwara Eliya","Walapane"], 'polonnaruwa': ["Dimbulagala","Elahera","Polonnaruwa"], 'puttalam': ["Anamaduwa","Chilaw","Puttalam"], 'ratnapura': ["Ayagama","Balangoda","Ratnapura","Embilipitiya"], 'trincomalee': ["Kantalai","Kinniya","Trincomalee"], 'vavuniya': ["Vavuniya","Vavuniya North"] };
const exportData = { "Pineapple": { hs: "0804.30", price: "$1.85", trend: "▲ +4.2%", demand: "12,500", season: "High Season", countries: ['UAE', 'Germany', 'UK', 'Japan', 'Qatar'], volumes: [4500, 3200, 2800, 1500, 1200], buyers: [ { name: "Carrefour Global (Dubai)", item: "MD2 Pineapple (5000 kg)", tag: "Verified", color: "green" }, { name: "Lulu Hypermarket (Qatar)", item: "Fresh Pineapple (2000 kg)", tag: "Verified", color: "green" }, { name: "Edeka Group (Germany)", item: "Organic Pineapple (1500 kg)", tag: "New", color: "blue" } ] }, "Cinnamon": { hs: "0906.11", price: "$12.50", trend: "▲ +1.8%", demand: "8,000", season: "Peak Harvest", countries: ['Mexico', 'USA', 'Peru', 'Colombia', 'Spain'], volumes: [3000, 2500, 1200, 800, 500], buyers: [ { name: "McCormick & Co (USA)", item: "Alba Grade Cinnamon (1000 kg)", tag: "Premium", color: "purple" }, { name: "Grupo Herdez (Mexico)", item: "C5 Special (5000 kg)", tag: "Verified", color: "green" } ] }, "Black Pepper": { hs: "0904.11", price: "$6.20", trend: "▼ -2.1%", demand: "15,000", season: "Mid Season", countries: ['India', 'Germany', 'USA', 'Vietnam', 'Italy'], volumes: [6000, 2000, 1800, 1500, 1000], buyers: [ { name: "Olam Spices (India)", item: "G1 Black Pepper (10,000 kg)", tag: "Bulk", color: "blue" } ] }, "Tea": { hs: "0902.40", price: "$4.80", trend: "▲ +0.5%", demand: "280,000", season: "Year Round", countries: ['Iraq', 'Turkey', 'Russia', 'Iran', 'China'], volumes: [40000, 35000, 30000, 25000, 10000], buyers: [ { name: "Ahmad Tea (UK)", item: "OP1 Grade (5000 kg)", tag: "Verified", color: "green" }, { name: "Beta Tea (Turkey)", item: "BOPF (20,000 kg)", tag: "Bulk", color: "blue" } ] }, "Coconut": { hs: "0801.11", price: "$0.95", trend: "▲ +5.5%", demand: "45,000", season: "High Season", countries: ['USA', 'Germany', 'China', 'Netherlands', 'Korea'], volumes: [12000, 8000, 7500, 5000, 2000], buyers: [ { name: "Vita Coco (USA)", item: "DC Fine Grade (15,000 kg)", tag: "Contract", color: "purple" } ] } };

// --- INIT ---
document.addEventListener("DOMContentLoaded", function() { 
    if(document.getElementById('nationalChart')) {
        const ctx = document.getElementById('nationalChart').getContext('2d');
        const gradientDemand = ctx.createLinearGradient(0, 0, 0, 400);
        gradientDemand.addColorStop(0, 'rgba(59, 130, 246, 0.8)'); gradientDemand.addColorStop(1, 'rgba(59, 130, 246, 0.1)');
        const gradientSupply = ctx.createLinearGradient(0, 0, 0, 400);
        gradientSupply.addColorStop(0, 'rgba(16, 185, 129, 0.8)'); gradientSupply.addColorStop(1, 'rgba(16, 185, 129, 0.1)');
        new Chart(ctx, { type: 'bar', data: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'], datasets: [{ label: 'Demand', data: [120, 130, 125, 140, 150], backgroundColor: gradientDemand, borderRadius: 4, barThickness: 12 }, { label: 'Supply', data: [115, 128, 140, 135, 120], backgroundColor: gradientSupply, borderRadius: 4, barThickness: 12 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: false, grid: { color: 'rgba(0,0,0,0.03)', borderDash: [5, 5] }, ticks: { font: { size: 10, family: "'Outfit', sans-serif" }, color: '#9CA3AF' }, border: { display: false } }, x: { grid: { display: false }, ticks: { font: { size: 10, family: "'Outfit', sans-serif" }, color: '#9CA3AF' }, border: { display: false } } } } });
    }
    
    if(document.getElementById('weatherGraph')) {
        const ctxWeather = document.getElementById('weatherGraph').getContext('2d');
        const gradientWeather = ctxWeather.createLinearGradient(0, 0, 0, 100);
        gradientWeather.addColorStop(0, 'rgba(251, 146, 60, 0.5)'); gradientWeather.addColorStop(1, 'rgba(251, 146, 60, 0.0)');
        new Chart(ctxWeather, { type: 'line', data: { labels: ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM'], datasets: [{ label: 'Temp', data: [18, 22, 26, 25, 21, 19], borderColor: '#F97316', backgroundColor: gradientWeather, borderWidth: 2, tension: 0.4, fill: true, pointRadius: 0 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false } } } });
    }

    if(document.getElementById('map-container')) {
        initMap();
    }
    
    if(document.getElementById('calc-crop')) {
        const cropSelect = document.getElementById('calc-crop');
        const farmCrops = Object.keys(exportData).sort(); // Using exportData keys as mock crops
        cropSelect.innerHTML = farmCrops.map(c => `<option value="${c}">${c}</option>`).join('');
    }
});
