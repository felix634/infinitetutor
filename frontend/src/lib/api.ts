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
    notes: (courseId: string, lessonId: string) => `${FUNCTIONS_URL}/notes?course_id=${courseId}&lesson_id=${lessonId}`,
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
