// API configuration - Using Supabase Edge Functions
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bwwauiisvxkdnossqzto.supabase.co';
export const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;

export const api = {
    // User data endpoints (Supabase Edge Functions)
    courses: `${FUNCTIONS_URL}/courses`,
    course: (id: string) => `${FUNCTIONS_URL}/courses?course_id=${id}`,
    saveCourse: `${FUNCTIONS_URL}/courses`,
    notes: (courseId: string, lessonId: string) => `${FUNCTIONS_URL}/notes?course_id=${courseId}&lesson_id=${lessonId}`,
    stats: `${FUNCTIONS_URL}/stats`,
    activity: `${FUNCTIONS_URL}/stats`,

    // AI Content endpoints (Supabase Edge Functions)
    generateSyllabus: `${FUNCTIONS_URL}/generate-syllabus`,
    generateLesson: `${FUNCTIONS_URL}/generate-lesson`,
    generateQuiz: `${FUNCTIONS_URL}/generate-quiz`,
};
