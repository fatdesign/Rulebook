const fs = require('fs');
let content = fs.readFileSync('app.js', 'utf8');

// The `key` variable in `app.js` is the account_id.
// So whenever we see `Authorization: key`, we change it to `Authorization: localStorage.getItem('tm_master_token')`.
// And we need to add `account_id: key` to the JSON bodies.

content = content.replace(/"Authorization":\s*key/g, '"Authorization": localStorage.getItem("tm_master_token")');

// In ai_coach, add account_id
content = content.replace(/body:\s*JSON\.stringify\(profileData\)/g, 'body: JSON.stringify({ ...profileData, account_id: key })');

// In settings (POST), add account_id
content = content.replace(/body:\s*JSON\.stringify\({\s*kill_switch_active/g, 'body: JSON.stringify({\n                        account_id: key,\n                        kill_switch_active');

// In notes (POST), add account_id
// const res = await fetch(`${API_URL}?action=notes`, { ... body: JSON.stringify({ ticket, note: newText })
content = content.replace(/body:\s*JSON\.stringify\(\{\s*ticket,\s*note:\s*newText\s*\}\)/g, 'body: JSON.stringify({ account_id: key, ticket, note: newText })');

// In journal (POST), add account_id
// body: JSON.stringify({ content: content, date: todayStr })
content = content.replace(/body:\s*JSON\.stringify\(\{\s*content:\s*content,\s*date:\s*todayStr\s*\}\)/g, 'body: JSON.stringify({ account_id: key, content: content, date: todayStr })');

// In DELETE (Reset Dashboard)
// const response = await fetch(`${API_URL}?account_id=${encodeURIComponent(key)}`, { method: "DELETE" ...
// Needs Authorization header if it doesn't have it.
content = content.replace(/method:\s*"DELETE"/g, 'method: "DELETE", headers: { "Authorization": localStorage.getItem("tm_master_token") }');

fs.writeFileSync('app.js', content);
console.log('app.js updated successfully pass 2');
