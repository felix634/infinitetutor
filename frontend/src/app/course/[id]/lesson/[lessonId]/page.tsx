'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronRight, ChevronLeft, Zap, Info, PlayCircle, Trophy, CheckCircle2, Clock, Maximize2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ReactFlowDiagram from '@/components/ReactFlowDiagram';
import QuizModal from '@/components/QuizModal';
import DiagramViewerModal from '@/components/DiagramViewerModal';
import NotesPanel from '@/components/NotesPanel';
import Header from '@/components/Header';
import { api, getSupabaseHeaders } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { estimateReadingMinutes } from '@/lib/utils';

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
    const [isDiagramOpen, setIsDiagramOpen] = useState(false);
    const [courseTitle, setCourseTitle] = useState('');
    const [isPassed, setIsPassed] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const lessonStartTime = useRef<number>(Date.now());
    const scrollSaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Log activity to stats endpoint
    const logActivity = async (minutes: number, lessons: number) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
            try {
                await fetch(api.stats, {
                    method: 'POST',
                    headers: getSupabaseHeaders(session.access_token),
                    body: JSON.stringify({ minutes, lessons })
                });
                console.log('✅ Activity logged:', { minutes, lessons });
            } catch (err) {
                console.error('Failed to log activity:', err);
            }
        }
    };

    type NavLesson = { title: string; chapterIdx: number; lessonIdx: number };
    const getPrevNext = useCallback((): { prev: NavLesson | null; next: NavLesson | null } => {
        const raw = localStorage.getItem('current_course');
        if (!raw) return { prev: null, next: null };
        const course = JSON.parse(raw) as { course_id: string; chapters: { id: string; title: string; lessons: string[] }[] };
        const chapters = course?.chapters || [];
        const flat: NavLesson[] = [];
        chapters.forEach((ch, ci) => ch.lessons.forEach((t, li) => flat.push({ title: t, chapterIdx: ci, lessonIdx: li })));
        const current = decodeURIComponent(params.lessonId as string);
        const idx = flat.findIndex((l) => l.title === current);
        if (idx < 0) return { prev: null, next: null };
        return { prev: idx > 0 ? flat[idx - 1]! : null, next: idx < flat.length - 1 ? flat[idx + 1]! : null };
    }, [params.lessonId]);

    const [nav, setNav] = useState<{ prev: NavLesson | null; next: NavLesson | null }>({ prev: null, next: null });

    const scrollStorageKey = useCallback(() => {
        const c = localStorage.getItem('current_course');
        if (!c) return null;
        const { course_id } = JSON.parse(c) as { course_id: string };
        return `lesson_scroll_${course_id}_${encodeURIComponent(decodeURIComponent(params.lessonId as string))}`;
    }, [params.lessonId]);

    const saveScroll = useCallback(() => {
        const key = scrollStorageKey();
        if (!key) return;
        try {
            localStorage.setItem(key, String(window.scrollY));
        } catch { /* ignore */ }
    }, [scrollStorageKey]);

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

    useEffect(() => {
        const raw = localStorage.getItem('current_course');
        if (raw) setNav(getPrevNext());
    }, [params.lessonId, params.id, getPrevNext]);

    useEffect(() => {
        if (loading || !content) return;
        const key = scrollStorageKey();
        const saved = key ? localStorage.getItem(key) : null;
        const y = saved ? Math.max(0, parseInt(saved, 10) || 0) : 0;
        const restore = () => {
            window.scrollTo(0, y);
        };
        if (typeof requestAnimationFrame !== 'undefined') requestAnimationFrame(restore);
        else setTimeout(restore, 0);

        const onScroll = () => {
            const { scrollHeight, clientHeight } = document.documentElement;
            const max = Math.max(0, scrollHeight - clientHeight);
            setScrollProgress(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);
            if (scrollSaveTimeout.current) clearTimeout(scrollSaveTimeout.current);
            scrollSaveTimeout.current = setTimeout(saveScroll, 300);
        };
        const onBeforeUnload = () => { saveScroll(); };

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('beforeunload', onBeforeUnload);
        onScroll();

        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('beforeunload', onBeforeUnload);
            if (scrollSaveTimeout.current) clearTimeout(scrollSaveTimeout.current);
        };
    }, [loading, content, saveScroll, scrollStorageKey]);

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

        // Calculate time spent on lesson (in minutes, minimum 1)
        const minutesSpent = Math.max(1, Math.round((Date.now() - lessonStartTime.current) / 60000));

        // Log activity for stats (time + 1 lesson completed)
        await logActivity(minutesSpent, 1);

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
                        headers: getSupabaseHeaders(session.access_token),
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

    const readingMinutes = estimateReadingMinutes(content?.content_markdown ?? '');
    const courseId = params.id as string;

    return (
        <div className="min-h-screen bg-[#0B0C10] text-slate-50">
            <Header />

            {/* Scroll progress bar */}
            <div className="fixed top-0 left-0 right-0 h-1 bg-white/5 z-40">
                <motion.div
                    className="h-full bg-gradient-to-r from-[#2AB7CA] to-[#FED766]"
                    initial={{ width: 0 }}
                    animate={{ width: `${scrollProgress}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
            </div>

            <main className="pt-24 md:pt-32 pb-16 md:pb-24 px-4 md:px-6 max-w-7xl mx-auto">
                {/* Two-column layout: Content + Notes sidebar */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left column: Lesson content */}
                    <div className="flex-1 space-y-10 md:space-y-16 min-w-0">
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
                                <div className="flex items-center gap-2 text-slate-500 text-sm">
                                    <Clock size={16} />
                                    <span>~{readingMinutes} min read</span>
                                </div>
                            </motion.div>
                        </section>

                        {/* Main Content */}
                        <section className="prose prose-invert prose-indigo max-w-none">
                            <div className="glass-dark border border-white/5 rounded-2xl md:rounded-[2.5rem] p-5 md:p-8 lg:p-12 shadow-2xl space-y-6 md:space-y-8">
                                <div className="text-slate-300 text-base md:text-lg leading-relaxed space-y-6 markdown-content">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {content.content_markdown}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </section>

                        {/* Visual Model */}
                        <section className="space-y-8">
                            <div className="flex items-center justify-between gap-4 flex-wrap">
                                <div className="flex items-center gap-3">
                                    <Zap className="text-[#FED766]" size={24} />
                                    <h2 className="text-2xl font-bold">Visual Mental Model</h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsDiagramOpen(true)}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-[#2AB7CA]/20 border border-white/10 hover:border-[#2AB7CA]/30 text-slate-300 hover:text-[#2AB7CA] transition-all text-sm font-medium"
                                >
                                    <Maximize2 size={16} />
                                    View full diagram
                                </button>
                            </div>
                            <div className="glass-dark border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
                                <ReactFlowDiagram mermaidCode={content.mermaid_code} showMiniMap={false} />
                                <div className="mt-8 flex gap-4 p-6 bg-[#2AB7CA]/10 border border-[#2AB7CA]/20 rounded-2xl">
                                    <Info className="text-[#2AB7CA] shrink-0" size={20} />
                                    <p className="text-slate-400 text-sm leading-relaxed">
                                        This diagram summarizes the relationship between the key concepts of {content.lesson_title}.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right column: Notes sidebar (sticky on desktop) */}
                    <div className="lg:w-80 xl:w-96 flex-shrink-0">
                        <div className="lg:sticky lg:top-28">
                            <div className="glass-dark border border-white/5 rounded-2xl p-6 shadow-2xl">
                                <NotesPanel
                                    courseId={params.id as string}
                                    lessonId={params.lessonId as string}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer / Quiz Trigger */}
                <section className="pt-12 space-y-6">
                    {/* Prev / Next navigation */}
                    <div className="flex items-center justify-between gap-4">
                        {nav.prev ? (
                            <button
                                type="button"
                                onClick={() => {
                                    saveScroll();
                                    router.push(`/course/${courseId}/lesson/${encodeURIComponent(nav.prev!.title)}`);
                                }}
                                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all font-medium"
                            >
                                <ChevronLeft size={18} />
                                Previous lesson
                            </button>
                        ) : (
                            <div />
                        )}
                        {nav.next ? (
                            isPassed ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        saveScroll();
                                        router.push(`/course/${courseId}/lesson/${encodeURIComponent(nav.next!.title)}`);
                                    }}
                                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all font-medium ml-auto"
                                >
                                    Next lesson
                                    <ChevronRight size={18} />
                                </button>
                            ) : (
                                <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-500 font-medium ml-auto cursor-not-allowed" title="Complete the quiz to unlock">
                                    <span className="text-xs">🔒</span>
                                    Next lesson
                                    <ChevronRight size={18} />
                                </div>
                            )
                        ) : (
                            <div />
                        )}
                    </div>

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
                                        onClick={() => {
                                            saveScroll();
                                            router.back();
                                        }}
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

            <DiagramViewerModal
                isOpen={isDiagramOpen}
                onClose={() => setIsDiagramOpen(false)}
                lessonTitle={content.lesson_title}
                mermaidCode={content.mermaid_code}
            />

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
