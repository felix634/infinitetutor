import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { topic, level, daily_time } = await req.json();

        const apiKey = Deno.env.get("GEMINI_API_KEY");
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY not configured");
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
    Create a comprehensive learning syllabus for someone who wants to learn "${topic}" 
    at the "${level}" level, with ${daily_time} minutes available per day.
    
    Structure the course with 3-5 chapters, each containing 3-6 lessons.
    Each lesson should be completable in about ${daily_time} minutes.
    
    Return ONLY valid JSON in this exact format:
    {
        "course_id": "unique-id-here",
        "title": "Course Title",
        "description": "Brief course description",
        "chapters": [
            {
                "title": "Chapter Title",
                "lessons": ["Lesson 1 Title", "Lesson 2 Title"]
            }
        ]
    }
    `;

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
            },
        });

        const responseText = result.response.text();
        const syllabusData = JSON.parse(responseText);

        // Ensure course_id exists
        if (!syllabusData.course_id) {
            syllabusData.course_id = crypto.randomUUID();
        }

        return new Response(JSON.stringify(syllabusData), {
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
