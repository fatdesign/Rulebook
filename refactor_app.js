const fs = require('fs');

let content = fs.readFileSync('app.js', 'utf8');

// 1. Remove link modal logic
content = content.replace(/\/\/ Link Account Modal Logic[\s\S]*?\/\/ Account Switcher Logic/g, "// Account Switcher Logic");

// 2. Fix the endpoint parameters from key to account_id
content = content.replace(/\?key=/g, "?account_id=");
content = content.replace(/&key=/g, "&account_id=");

// 3. Inject Authorization token into fetch headers
content = content.replace(/headers:\s*\{([^}]*)\}/g, (match, inner) => {
    if (inner.includes("Authorization")) return match; // already has it
    return `headers: {${inner}, "Authorization": localStorage.getItem("tm_master_token") }`;
});

// For fetches without options (like journal and notes)
content = content.replace(/fetch\(\`\$\{API_URL\}\?action=journal&account_id=\$\{encodeURIComponent\(key\)\}&date=\$\{todayStr\}\`\)/g, 
  "fetch(`${API_URL}?action=journal&account_id=${encodeURIComponent(key)}&date=${todayStr}`, { headers: { 'Authorization': localStorage.getItem('tm_master_token') } })");

content = content.replace(/fetch\(\`\$\{API_URL\}\?action=notes&account_id=\$\{encodeURIComponent\(key\)\}\`\)/g, 
  "fetch(`${API_URL}?action=notes&account_id=${encodeURIComponent(key)}`, { headers: { 'Authorization': localStorage.getItem('tm_master_token') } })");

fs.writeFileSync('app.js', content);
console.log('app.js updated successfully');
