import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function getUserEmail(authHeader: string | null): string | null {
    if (!authHeader) return null;
    try {
        const token = authHeader.replace("Bearer ", "");
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.email;
    } catch {
        return null;
    }
}

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("authorization");
    const userEmail = getUserEmail(authHeader);

    if (!userEmail) {
        return new Response(
            JSON.stringify({ error: "Not authenticated" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    // Parse course_id and lesson_id from URL
    const url = new URL(req.url);
    const params = url.searchParams;
    const courseId = params.get("course_id");
    const lessonId = params.get("lesson_id");

    if (!courseId || !lessonId) {
        return new Response(
            JSON.stringify({ error: "Missing course_id or lesson_id" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    try {
        // GET - Retrieve note
        if (req.method === "GET") {
            const { data } = await supabase
                .from("user_notes")
                .select("content")
                .eq("user_email", userEmail)
                .eq("course_id", courseId)
                .eq("lesson_id", lessonId)
                .single();

            return new Response(JSON.stringify({ content: data?.content || "" }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // POST - Save note
        if (req.method === "POST") {
            const { content } = await req.json();

            const { error } = await supabase
                .from("user_notes")
                .upsert({
                    user_email: userEmail,
                    course_id: courseId,
                    lesson_id: lessonId,
                    content,
                    updated_at: new Date().toISOString(),
                }, {
                    onConflict: "user_email,course_id,lesson_id"
                });

            if (error) throw error;
            return new Response(JSON.stringify({ message: "Note saved" }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        return new Response(
            JSON.stringify({ error: "Method not allowed" }),
            { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
