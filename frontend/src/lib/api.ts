// API configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = {
    // Auth endpoints
    register: `${API_URL}/auth/register`,
    login: `${API_URL}/auth/login`,
    verify: `${API_URL}/auth/verify`,
    logout: `${API_URL}/auth/logout`,
    me: `${API_URL}/auth/me`,

    // User endpoints
    courses: `${API_URL}/user/courses`,
    course: (id: string) => `${API_URL}/user/course/${id}`,
    saveCourse: `${API_URL}/user/save-course`,
    suggestions: `${API_URL}/user/suggestions`,

    // Content endpoints
    generateSyllabus: `${API_URL}/generate-syllabus`,
    generateLesson: `${API_URL}/generate-lesson`,
    generateQuiz: `${API_URL}/generate-quiz`,
    generateDiagram: `${API_URL}/generate-diagram`,
};
