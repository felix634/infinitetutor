import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    // Logout is handled client-side through Supabase Auth
    // This endpoint exists for compatibility but just returns success
    return new Response(
        JSON.stringify({ message: "Logged out successfully" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
});
