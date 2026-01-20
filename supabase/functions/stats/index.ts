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

function getToday(): string {
    return new Date().toISOString().split("T")[0];
}

async function calculateStreak(supabase: any, userEmail: string): Promise<number> {
    const { data } = await supabase
        .from("user_activity")
        .select("activity_date")
        .eq("user_email", userEmail)
        .gt("minutes_studied", 0)
        .order("activity_date", { ascending: false });

    if (!data || data.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    let expectedDate = new Date(today);

    for (const row of data) {
        const activityDate = new Date(row.activity_date);
        const expected = new Date(expectedDate);
        expected.setHours(0, 0, 0, 0);
        activityDate.setHours(0, 0, 0, 0);

        if (activityDate.getTime() === expected.getTime()) {
            streak++;
            expectedDate.setDate(expectedDate.getDate() - 1);
        } else if (activityDate.getTime() === expected.getTime() - 86400000) {
            expectedDate = activityDate;
            streak++;
            expectedDate.setDate(expectedDate.getDate() - 1);
        } else {
            break;
        }
    }

    return streak;
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

    const today = getToday();

    try {
        // GET - Get stats
        if (req.method === "GET") {
            const { data } = await supabase
                .from("user_activity")
                .select("minutes_studied, lessons_completed, daily_goal_minutes")
                .eq("user_email", userEmail)
                .eq("activity_date", today)
                .single();

            const todayMinutes = data?.minutes_studied || 0;
            const todayLessons = data?.lessons_completed || 0;
            const dailyGoal = data?.daily_goal_minutes || 30;
            const streak = await calculateStreak(supabase, userEmail);

            return new Response(JSON.stringify({
                streak,
                today_minutes: todayMinutes,
                today_lessons: todayLessons,
                daily_goal_minutes: dailyGoal,
                goal_progress_percent: dailyGoal > 0 ? Math.min(100, Math.round((todayMinutes / dailyGoal) * 100)) : 0,
            }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // POST - Log activity
        if (req.method === "POST") {
            const { minutes = 0, lessons = 0 } = await req.json();

            // Get current values
            const { data: current } = await supabase
                .from("user_activity")
                .select("minutes_studied, lessons_completed, daily_goal_minutes")
                .eq("user_email", userEmail)
                .eq("activity_date", today)
                .single();

            const newMinutes = (current?.minutes_studied || 0) + minutes;
            const newLessons = (current?.lessons_completed || 0) + lessons;

            const { error } = await supabase
                .from("user_activity")
                .upsert({
                    user_email: userEmail,
                    activity_date: today,
                    minutes_studied: newMinutes,
                    lessons_completed: newLessons,
                    daily_goal_minutes: current?.daily_goal_minutes || 30,
                }, {
                    onConflict: "user_email,activity_date"
                });

            if (error) throw error;
            return new Response(JSON.stringify({ message: "Activity logged" }), {
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
