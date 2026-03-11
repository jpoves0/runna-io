const TURSO_URL = 'https://runna-io-jpoves0.aws-eu-west-1.turso.io/v3/pipeline';
const TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzAyMDU1MDcsImlkIjoiNTM3ZGNkM2QtMzA0OS00YzE1LTk4ZDctNGQ0Y2Y0NzBhZDIxIiwicmlkIjoiMzNiZDgyODAtYTExYi00MDg0LTg1MzUtMTI5MWY1ZDFhYjFjIn0.VXeiY59wcl3k2hQA24n8v_5yGlEiLEUBxNqTIMnFcL4-nbHziz7bVvVuRAT4hiKMDq5NgN8MKF1ans2obpwzAQ';

async function query(sql) {
  const res = await fetch(TURSO_URL, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + TURSO_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({ requests: [{ type: 'execute', stmt: { sql } }, { type: 'close' }] })
  });
  const data = await res.json();
  if (!data.results || !data.results[0] || !data.results[0].response || !data.results[0].response.result) {
    console.error('Query failed:', JSON.stringify(data, null, 2));
    return [];
  }
  const result = data.results[0].response.result;
  return result.rows.map(row => {
    const obj = {};
    result.cols.forEach((col, i) => obj[col.name] = row[i] ? row[i].value : null);
    return obj;
  });
}

async function exec(sql) {
  const res = await fetch(TURSO_URL, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + TURSO_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({ requests: [{ type: 'execute', stmt: { sql } }, { type: 'close' }] })
  });
  const data = await res.json();
  return data;
}

(async () => {
  // Get territories for Juan's routes
  console.log('=== TERRITORIES FOR ROUTES WITH FEED EVENTS ===');
  const territories = await query("SELECT t.route_id, t.user_id, t.area, u.username FROM territories t LEFT JOIN users u ON t.user_id = u.id ORDER BY t.conquered_at");
  territories.forEach(t => {
    console.log(`  route=${(t.route_id||'null').substring(0,8)} | user=${t.username} | area=${t.area}`);
  });

  // Now get Juan's feed events that have area=0 and have a territory
  console.log('\n=== UPDATING FEED EVENTS WITH CORRECT AREA ===');
  const events = await query("SELECT fe.id, fe.route_id, fe.new_area, fe.metadata, t.area as territory_area FROM feed_events fe LEFT JOIN territories t ON fe.route_id = t.route_id WHERE fe.event_type = 'activity' AND (fe.new_area = 0 OR fe.new_area IS NULL) AND t.area IS NOT NULL AND t.area > 0");
  
  for (const e of events) {
    console.log(`  Event ${e.id} | route=${(e.route_id||'null').substring(0,8)} | current_area=${e.new_area} | territory_area=${e.territory_area}`);
    // Update the feed event with the correct area
    const updateSql = `UPDATE feed_events SET new_area = ${e.territory_area} WHERE id = '${e.id}'`;
    console.log(`    Updating: ${updateSql}`);
    await exec(updateSql);
    console.log(`    Done!`);
  }

  // Get all feed events that have NULL metadata and route_ids
  // We can at least add empty metadata structure
  console.log('\n=== CHECKING IF ANY FEED EVENTS STILL HAVE ISSUES ===');
  const remaining = await query("SELECT id, user_id, route_id, new_area, metadata FROM feed_events WHERE event_type = 'activity' ORDER BY created_at DESC");
  remaining.forEach(e => {
    const status = [];
    if (e.new_area === null || e.new_area === '0') status.push('area=0');
    if (!e.metadata || e.metadata === 'null') status.push('no-metadata');
    if (status.length > 0) {
      console.log(`  ${e.id.substring(0,8)} | route=${(e.route_id||'null').substring(0,8)} | area=${e.new_area} | issues: ${status.join(', ')}`);
    }
  });
})();
