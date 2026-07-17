const API_URL = "https://rulebook.f-klavun.workers.dev/";

async function testNotes() {
    const key = "DemoUser2:123456";
    const ticket = "56789";
    const note = "Test Note " + Date.now();
    
    console.log("POSTing note...");
    const res = await fetch(`${API_URL}?action=notes`, {
        method: "POST",
        headers: { "Authorization": key, "Content-Type": "application/json" },
        body: JSON.stringify({ ticket, note })
    });
    
    console.log("POST status:", res.status);
    console.log("POST body:", await res.text());
    
    console.log("\nGETing notes...");
    const resGet = await fetch(`${API_URL}?action=notes&key=${encodeURIComponent(key)}`);
    console.log("GET status:", resGet.status);
    const data = await resGet.json();
    console.log("GET results:", data);
}

testNotes();
