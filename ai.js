/*
    Kurby AI - Backend (worker.js)
    EASY DEPLOY VERSION: Works with copy-paste in Cloudflare Dashboard!
*/

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
    const url = new URL(request.url);
    const msg = url.searchParams.get("msg");
    const key = url.searchParams.get("key"); // Gemini Key

    if (!msg) {
        return new Response(JSON.stringify({ error: "No message" }), {
            status: 400,
            headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
    }

    // 1. GEMINI (Priority)
    if (key && key.length > 10) {
        try {
            const gemUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
            const res = await fetch(gemUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: msg }] }] })
            });
            const data = await res.json();
            if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                return new Response(JSON.stringify({ response: data.candidates[0].content.parts[0].text }), {
                    headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" }
                });
            }
        } catch (e) {}
    }

    // 2. POPCAT (Fallback)
    try {
        const popRes = await fetch(`https://api.popcat.xyz/chatbot?msg=${encodeURIComponent(msg)}`);
        const popData = await popRes.json();
        return new Response(JSON.stringify({ response: popData.response }), {
            headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
    } catch (e) {
        return new Response(JSON.stringify({ response: "AI connection error." }), {
            headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
    }
}
