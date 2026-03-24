// config/mysql.js
// ================
// MySQL connection pool — used when DB_MODE=mysql in .env
//
// TO ACTIVATE:
//   1. npm install mysql2
//   2. Fill in MYSQL_* variables in .env
//   3. Run the SQL in database.mysql.sql against your MySQL server
//   4. Set DB_MODE=mysql in .env
//   5. Replace function bodies in services/store.js with the
//      equivalents shown in the comments below.

let pool = null;

function getPool() {
  if (pool) return pool;

  try {
    const mysql = require("mysql2/promise");
    pool = mysql.createPool({
      host     : process.env.MYSQL_HOST     || "localhost",
      port     : parseInt(process.env.MYSQL_PORT || "3306"),
      user     : process.env.MYSQL_USER     || "root",
      password : process.env.MYSQL_PASSWORD || "",
      database : process.env.MYSQL_DATABASE || "agriflow",
      waitForConnections : true,
      connectionLimit    : 10,
      queueLimit         : 0,
    });
    console.log("✅ MySQL pool connected.");
    return pool;
  } catch {
    throw new Error(
      "DB_MODE is set to 'mysql' but mysql2 is not installed.\n" +
      "Run: npm install mysql2"
    );
  }
}

// ── EXAMPLE REPLACEMENTS for services/store.js ───────────────
//
// findSubmissions({ district, crop, page, limit }):
// ──────────────────────────────────────────────────
//   const pool = getPool();
//   let sql    = "SELECT * FROM submissions WHERE 1=1";
//   const params = [];
//   if (district) { sql += " AND district = ?"; params.push(district); }
//   if (crop)     { sql += " AND crop = ?";     params.push(crop);     }
//   sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
//   params.push(limit, (page - 1) * limit);
//   const [rows] = await pool.query(sql, params);
//   const [[{ total }]] = await pool.query(
//     "SELECT COUNT(*) as total FROM submissions WHERE 1=1" +
//     (district ? ` AND district = '${district}'` : "")
//   );
//   return { data: rows, total, page, limit };

module.exports = { getPool };
