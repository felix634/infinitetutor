import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";
import { createClient } from "npm:@supabase/supabase-js";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { course_id, lesson_title, topic, level } = await req.json();

        // Initialize Supabase client to check cache
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Check cache first
        const { data: cachedLesson } = await supabase
            .from("lessons")
            .select("*")
            .eq("course_id", course_id)
            .eq("lesson_title", lesson_title)
            .single();

        if (cachedLesson) {
            return new Response(JSON.stringify({
                lesson_title: cachedLesson.lesson_title,
                content_markdown: cachedLesson.content_markdown,
                mermaid_code: cachedLesson.mermaid_code,
                explanation: cachedLesson.explanation,
                summary: "Loaded from cache"
            }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // Generate new lesson
        const apiKey = Deno.env.get("GEMINI_API_KEY");
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY not configured");
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
    Generate rich lesson content for '${lesson_title}' 
    as part of a course on '${topic}' at the '${level}' level.
    
    The content should include:
    1. A long, engaging guide in Markdown format.
    2. A Mermaid.js MINDMAP diagram (NOT flowchart) that visualizes the main concepts.
       - Use the mindmap syntax: mindmap
         root((Main Topic))
           Branch1
             Leaf1
             Leaf2
           Branch2
       - Keep labels SHORT (max 3-4 words)
       - Use emojis to make it visual (📚 🎯 💡 🔑 ⚡ 🌟 etc.)
       - Maximum 4 main branches, 2-3 leaves per branch
    3. A 1-sentence summary.
    
    Return ONLY valid JSON:
    {
        "lesson_title": "${lesson_title}",
        "content_markdown": "Markdown string here...",
        "mermaid_code": "mindmap\\n  root((Topic))\\n    Branch1\\n      Leaf1",
        "summary": "Summary here."
    }
    `;

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
            },
        });

        let lessonData = JSON.parse(result.response.text());

        // Handle case where Gemini returns an array instead of object
        if (Array.isArray(lessonData)) {
            lessonData = lessonData[0];
        }

        // Cache the lesson
        await supabase.from("lessons").upsert({
            course_id,
            lesson_title,
            topic,
            level,
            content_markdown: lessonData.content_markdown,
            mermaid_code: lessonData.mermaid_code || "",
            explanation: lessonData.summary || "",
            created_at: new Date().toISOString(),
        });

        return new Response(JSON.stringify(lessonData), {
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
