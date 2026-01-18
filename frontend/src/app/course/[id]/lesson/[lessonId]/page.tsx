'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronRight, Zap, Info, PlayCircle, Trophy, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import MermaidRenderer from '@/components/MermaidRenderer';
import QuizModal from '@/components/QuizModal';
import Header from '@/components/Header';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';

interface LessonContent {
    lesson_title: string;
    content_markdown: string;
    mermaid_code: string;
    image_prompt: string;
    summary: string;
}

export default function LessonPage() {
    const params = useParams();
    const router = useRouter();
    const [content, setContent] = useState<LessonContent | null>(null);
    const [loading, setLoading] = useState(true);
    const [isQuizOpen, setIsQuizOpen] = useState(false);
    const [courseTitle, setCourseTitle] = useState('');
    const [isPassed, setIsPassed] = useState(false);

    useEffect(() => {
        const savedCourse = localStorage.getItem('current_course');
        if (savedCourse) {
            const course = JSON.parse(savedCourse);
            setCourseTitle(course.title);

            // Pass course_id for caching
            const urlLessonTitle = decodeURIComponent(params.lessonId as string);
            const courseId = course.course_id || params.id;
            fetchLessonContent(urlLessonTitle, course.title, courseId as string);

            // Check if already passed
            const progress = JSON.parse(localStorage.getItem('course_progress') || '{}');
            if (progress[urlLessonTitle]) {
                setIsPassed(true);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.lessonId]);
    const [error, setError] = useState<string | null>(null);

    const fetchLessonContent = async (title: string, topic: string, courseId: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(api.generateLesson, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lesson_title: title,
                    topic,
                    level: 'Intermediate',
                    course_id: courseId  // Include course_id for caching
                }),
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();

            if (!data || !data.content_markdown) {
                throw new Error('Invalid response from server');
            }

            setContent(data);
        } catch (err) {
            console.error('Error fetching lesson:', err);
            setError(err instanceof Error ? err.message : 'Failed to load lesson');
        } finally {
            setLoading(false);
        }
    };

    const handlePass = async () => {
        setIsPassed(true);
        const urlLessonTitle = decodeURIComponent(params.lessonId as string);
        const progress = JSON.parse(localStorage.getItem('course_progress') || '{}');
        progress[urlLessonTitle] = true;
        localStorage.setItem('course_progress', JSON.stringify(progress));

        // Sync progress to backend
        const savedCourse = localStorage.getItem('current_course');
        if (savedCourse) {
            const course = JSON.parse(savedCourse);
            const totalLessons = course.chapters?.reduce((acc: number, c: { lessons: string[] }) => acc + c.lessons.length, 0) || 1;
            const completedLessons = Object.keys(progress).length;
            const progressPercent = Math.round((completedLessons / totalLessons) * 100);

            // Update backend with progress
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.access_token) {
                try {
                    await fetch(api.saveCourse, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${session.access_token}`
                        },
                        body: JSON.stringify({
                            course_id: course.course_id,
                            title: course.title,
                            topic: course.topic || course.title,
                            level: course.level || 'Intermediate',
                            progress_percent: progressPercent,
                            chapters: course.chapters || []
                        }),
                    });
                    console.log('✅ Progress synced to backend:', progressPercent + '%');
                } catch (err) {
                    console.error('Failed to sync progress:', err);
                }
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center">
                <div className="flex flex-col items-center gap-6">
                    <div className="w-16 h-16 border-4 border-[#2AB7CA] border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 font-medium animate-pulse">Generating your interactive lesson...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center">
                <div className="flex flex-col items-center gap-6 text-center px-4">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                        <span className="text-3xl">⚠️</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white">Failed to Load Lesson</h2>
                    <p className="text-slate-400 max-w-md">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-[#2AB7CA] text-white rounded-xl font-medium hover:bg-indigo-600 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!content) return null;

    return (
        <div className="min-h-screen bg-[#0B0C10] text-slate-50">
            <Header />

            <main className="pt-24 md:pt-32 pb-16 md:pb-24 px-4 md:px-6 max-w-4xl mx-auto space-y-10 md:space-y-16">
                {/* Hero Section */}
                <section className="space-y-4 md:space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2AB7CA]/10 border border-[#2AB7CA]/20 text-[#2AB7CA] text-xs font-bold uppercase tracking-tighter">
                            Lesson Content
                        </div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                            {content.lesson_title}
                        </h1>
                        <p className="text-base md:text-xl text-slate-400 max-w-2xl leading-relaxed">
                            {content.summary}
                        </p>
                    </motion.div>
                </section>

                {/* Main Content */}
                <section className="prose prose-invert prose-indigo max-w-none">
                    <div className="glass-dark border border-white/5 rounded-2xl md:rounded-[2.5rem] p-5 md:p-8 lg:p-12 shadow-2xl space-y-6 md:space-y-8">
                        <div className="text-slate-300 text-base md:text-lg leading-relaxed space-y-6 markdown-content">
                            <ReactMarkdown>
                                {content.content_markdown}
                            </ReactMarkdown>
                        </div>
                    </div>
                </section>

                {/* Visual Model */}
                <section className="space-y-8">
                    <div className="flex items-center gap-3">
                        <Zap className="text-[#FED766]" size={24} />
                        <h2 className="text-2xl font-bold">Visual Mental Model</h2>
                    </div>
                    <div className="glass-dark border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
                        <MermaidRenderer chart={content.mermaid_code} />
                        <div className="mt-8 flex gap-4 p-6 bg-[#2AB7CA]/10 border border-[#2AB7CA]/20 rounded-2xl">
                            <Info className="text-[#2AB7CA] shrink-0" size={20} />
                            <p className="text-slate-400 text-sm leading-relaxed">
                                This diagram summarizes the relationship between the key concepts of {content.lesson_title}.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Footer / Quiz Trigger */}
                <section className="pt-12">
                    <div className="glass-dark border border-[#2AB7CA]/30 rounded-[3rem] p-12 text-center space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#2AB7CA]/10 blur-[100px] -mr-32 -mt-32 rounded-full" />

                        <div className="max-w-xl mx-auto space-y-6 relative z-10">
                            {isPassed ? (
                                <div className="space-y-4">
                                    <div className="w-20 h-20 bg-[#FED766]/20 rounded-full flex items-center justify-center text-[#FED766] mx-auto shadow-lg shadow-[#FED766]/20">
                                        <CheckCircle2 size={40} />
                                    </div>
                                    <h3 className="text-3xl font-black">Lesson Mastered!</h3>
                                    <p className="text-slate-400 text-lg">
                                        You've completed the quiz and demonstrated proficiency in these concepts. Ready for the next one?
                                    </p>
                                    <button
                                        onClick={() => router.back()}
                                        className="inline-flex items-center gap-2 bg-[#2AB7CA] hover:bg-indigo-600 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-xl shadow-[#2AB7CA]/20"
                                    >
                                        Return to Dashboard
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="w-20 h-20 bg-[#2AB7CA]/20 rounded-full flex items-center justify-center text-[#2AB7CA] mx-auto shadow-lg shadow-[#2AB7CA]/20">
                                        <PlayCircle size={40} />
                                    </div>
                                    <h3 className="text-3xl font-black">Knowledge Check</h3>
                                    <p className="text-slate-400 text-lg">
                                        Complete a short quiz to verify your understanding. Score at least <span className="text-white font-bold">4/6</span> to unlock the next lesson.
                                    </p>
                                    <button
                                        onClick={() => setIsQuizOpen(true)}
                                        className="w-full bg-white text-black font-bold py-5 rounded-2xl hover:bg-[#2AB7CA] hover:text-white transition-all shadow-2xl flex items-center justify-center gap-3 group"
                                    >
                                        <span className="text-lg">Take the Quiz</span>
                                        <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </main>

            <QuizModal
                isOpen={isQuizOpen}
                onClose={() => setIsQuizOpen(false)}
                lessonTitle={content.lesson_title}
                topic={courseTitle}
                level="Intermediate"
                onPass={handlePass}
            />
        </div>
    );
}
