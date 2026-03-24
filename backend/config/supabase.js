// config/supabase.js
// ===================
// Supabase client — used when DB_MODE=supabase in .env
//
// TO ACTIVATE:
//   1. npm install @supabase/supabase-js
//   2. Fill in SUPABASE_URL and SUPABASE_SERVICE_KEY in .env
//   3. Set DB_MODE=supabase in .env
//   4. Replace the function bodies in services/store.js with the
//      equivalents shown in the comments below each section.

let supabase = null;

function getClient() {
  if (supabase) return supabase;

  // Dynamically require so the app doesn't crash if the package
  // isn't installed yet (DB_MODE=memory doesn't need it).
  try {
    const { createClient } = require("@supabase/supabase-js");
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY  // service role key bypasses RLS
    );
    console.log("✅ Supabase client connected.");
    return supabase;
  } catch {
    throw new Error(
      "DB_MODE is set to 'supabase' but @supabase/supabase-js is not installed.\n" +
      "Run: npm install @supabase/supabase-js"
    );
  }
}

// ── EXAMPLE REPLACEMENTS for services/store.js ───────────────
//
// findSubmissions({ district, crop, page, limit }):
// ──────────────────────────────────────────────────
//   const sb = getClient();
//   let q = sb.from("submissions").select("*", { count: "exact" });
//   if (district) q = q.eq("district", district);
//   if (crop)     q = q.eq("crop",     crop);
//   q = q.order("created_at", { ascending: false })
//         .range((page-1)*limit, page*limit - 1);
//   const { data, count, error } = await q;
//   if (error) throw error;
//   return { data, total: count, page, limit };
//
// createSubmission(data):
// ──────────────────────
//   const sb = getClient();
//   const { data: row, error } = await sb
//     .from("submissions").insert(data).select().single();
//   if (error) throw error;
//   return row;
//
// getDistrictAggregates(crop):
// ────────────────────────────
//   const sb = getClient();
//   let q = sb.from("district_aggregates").select("*");
//   if (crop && crop !== "all") q = q.eq("crop", crop);
//   const { data, error } = await q;
//   if (error) throw error;
//   return data;
//
// getKPIs():
// ──────────
//   const sb = getClient();
//   const { data, error } = await sb.from("admin_kpis").select("*").single();
//   if (error) throw error;
//   return data;

module.exports = { getClient };
