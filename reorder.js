const fs = require("fs");

const file = "c:\\Users\\Limitless\\.gemini\\antigravity\\scratch\\TradeMaster\\index.html";
let content = fs.readFileSync(file, "utf8");

// We need to reorder:
// 1. Data Row 2 (Analysis)
// 2. Data Row 4 (Calendar & Monthly)
// 3. Data Row 3 (AI)
// 4. Daily Stats Table

// Let's split by these exact markers
const m2 = "                <!-- Data Row 2 (Analysis) -->";
const m4 = "                <!-- Data Row 4 (Calendar & Monthly) -->";
const m3 = "                <!-- Data Row 3 (AI) -->";
const mDaily = "                <!-- Daily Stats Table -->";
const mStrat = "                <!-- Strategy Definitions Panel -->";

const p2 = content.indexOf(m2);
const p4 = content.indexOf(m4);
const p3 = content.indexOf(m3);
const pDaily = content.indexOf(mDaily);
const pStrat = content.indexOf(mStrat);

const pre = content.substring(0, p2);
const block2 = content.substring(p2, p4);
const block4 = content.substring(p4, p3);
const block3 = content.substring(p3, pDaily);
const blockDaily = content.substring(pDaily, pStrat);
const post = content.substring(pStrat);

// New order:
// Data Row 4 (Calendar)
// Data Row 2 (Analysis)
// Daily Stats Table
// Data Row 3 (AI)
const newContent = pre + block4 + block2 + blockDaily + block3 + post;

fs.writeFileSync(file, newContent, "utf8");
console.log("Done");
