// API configuration - Using Supabase Edge Functions
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bwwauiisvxkdnossqzto.supabase.co';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3d2F1aWlzdnhrZG5vc3NxenRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NTQyNDUsImV4cCI6MjA4NDIzMDI0NX0.Wdl-ksRUwQiWbEnPMlknWfpoHYwPy6HsJ8ZGEESn6Uo';
export const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;

// Helper to get default headers for Supabase functions
export function getSupabaseHeaders(authToken?: string): Record<string, string> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
    };
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }
    return headers;
}

export const api = {
    // User data endpoints (Supabase Edge Functions)
    courses: `${FUNCTIONS_URL}/courses`,
    course: (id: string) => `${FUNCTIONS_URL}/courses?course_id=${id}`,
    saveCourse: `${FUNCTIONS_URL}/courses`,
    notes: (courseId: string, lessonId?: string) => {
        let url = `${FUNCTIONS_URL}/notes?course_id=${encodeURIComponent(courseId)}`;
        if (lessonId) url += `&lesson_id=${encodeURIComponent(lessonId)}`;
        return url;
    },
    stats: `${FUNCTIONS_URL}/stats`,
    activity: `${FUNCTIONS_URL}/stats`,
    suggestions: `${FUNCTIONS_URL}/suggestions`,
    logout: `${FUNCTIONS_URL}/logout`,

    // AI Content endpoints (Supabase Edge Functions)
    generateSyllabus: `${FUNCTIONS_URL}/generate-syllabus`,
    generateLesson: `${FUNCTIONS_URL}/generate-lesson`,
    generateQuiz: `${FUNCTIONS_URL}/generate-quiz`,
    generateDiagram: `${FUNCTIONS_URL}/generate-diagram`,
};

// Retry wrapper for Supabase Edge Functions (handles cold starts)
export async function fetchWithRetry(
    url: string,
    options: RequestInit,
    maxRetries = 2
): Promise<Response> {
    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(url, options);
            if (response.ok) return response;
            // On server errors (5xx), retry; on client errors (4xx), don't
            if (response.status >= 500 && attempt < maxRetries) {
                console.warn(`Attempt ${attempt + 1} failed (${response.status}), retrying...`);
                await new Promise(r => setTimeout(r, 1500 * (attempt + 1)));
                continue;
            }
            return response; // Return non-retryable error responses as-is
        } catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err));
            if (attempt < maxRetries) {
                console.warn(`Attempt ${attempt + 1} failed (${lastError.message}), retrying...`);
                await new Promise(r => setTimeout(r, 1500 * (attempt + 1)));
            }
        }
    }
    throw lastError || new Error('Request failed after retries');
}
