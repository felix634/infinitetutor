import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Get user email from JWT token
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

    const url = new URL(req.url);
    const courseId = url.searchParams.get("course_id");

    try {
        // GET /courses?course_id=xxx - Get a single course
        if (req.method === "GET" && courseId) {
            const { data, error } = await supabase
                .from("user_courses")
                .select("*")
                .eq("user_email", userEmail)
                .eq("course_id", courseId)
                .single();

            if (error && error.code !== "PGRST116") throw error;
            if (!data) {
                return new Response(
                    JSON.stringify({ error: "Course not found" }),
                    { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
                );
            }

            // Parse chapters_json back to object
            const course = {
                ...data,
                chapters: data.chapters_json ? JSON.parse(data.chapters_json) : []
            };

            return new Response(JSON.stringify(course), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // GET /courses - List all user courses
        if (req.method === "GET") {
            const { data, error } = await supabase
                .from("user_courses")
                .select("*")
                .eq("user_email", userEmail)
                .order("last_accessed", { ascending: false });

            if (error) throw error;
            return new Response(JSON.stringify(data || []), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // POST /courses - Save a course
        if (req.method === "POST") {
            const body = await req.json();

            const { error } = await supabase
                .from("user_courses")
                .upsert({
                    user_email: userEmail,
                    course_id: body.course_id,
                    title: body.title,
                    topic: body.topic || body.title,
                    level: body.level || "Intermediate",
                    progress_percent: body.progress_percent || 0,
                    chapters_json: JSON.stringify(body.chapters || []),
                    last_accessed: new Date().toISOString(),
                }, {
                    onConflict: "user_email,course_id"
                });

            if (error) throw error;
            return new Response(JSON.stringify({ message: "Course saved" }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        return new Response(
            JSON.stringify({ error: "Not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
