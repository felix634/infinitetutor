import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { concept, level } = await req.json();

        const apiKey = Deno.env.get("GEMINI_API_KEY");
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY not configured");
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
    Create a Mermaid.js MINDMAP diagram for the concept "${concept}" at "${level}" level.
    
    Use mindmap syntax:
    mindmap
      root((Main Topic))
        Branch1
          Leaf1
          Leaf2
        Branch2
          Leaf3
    
    Keep labels SHORT (max 3-4 words).
    Use emojis (📚 🎯 💡 🔑 ⚡ 🌟).
    Maximum 4 main branches, 2-3 leaves per branch.
    
    Return ONLY the mermaid code, no explanation.
    `;

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        const mermaidCode = result.response.text().trim();

        return new Response(JSON.stringify({ mermaid_code: mermaidCode }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            }
        );
    }
});
