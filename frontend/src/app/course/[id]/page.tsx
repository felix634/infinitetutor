'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    BookOpen,
    ChevronRight,
    PlayCircle,
    CheckCircle2,
    Layout,
    Clock,
    Award,
    Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Header from '@/components/Header';
import { api } from '@/lib/api';

interface Lesson {
    title: string;
}

interface Chapter {
    id: string;
    title: string;
    lessons: string[];
}

interface Course {
    course_id: string;
    title: string;
    chapters: Chapter[];
}

export default function CourseDashboard() {
    const params = useParams();
    const router = useRouter();
    const [course, setCourse] = useState<Course | null>(null);
    const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
    const [progress, setProgress] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCourse();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id]);

    const loadCourse = async () => {
        setLoading(true);

        // First try localStorage
        const savedCourse = localStorage.getItem('current_course');
        if (savedCourse) {
            const parsed = JSON.parse(savedCourse);
            // Check if this is the right course and has chapters
            if (parsed.course_id === params.id && parsed.chapters && parsed.chapters.length > 0) {
                setCourse(parsed);
                setLoading(false);
                loadProgress();
                return;
            }
        }

        // Fetch from API if logged in
        const token = localStorage.getItem('auth_token');
        if (token) {
            try {
                const response = await fetch(api.course(params.id as string), {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    // Save to localStorage for future use
                    localStorage.setItem('current_course', JSON.stringify(data));
                    setCourse(data);
                    setLoading(false);
                    loadProgress();
                    return;
                }
            } catch (error) {
                console.error('Failed to fetch course:', error);
            }
        }

        // If we still don't have a course, redirect to home
        router.push('/');
    };

    const loadProgress = () => {
        const savedProgress = localStorage.getItem('course_progress');
        if (savedProgress) {
            setProgress(JSON.parse(savedProgress));
        }
    };

    const totalLessons = course ? course.chapters.reduce((acc, c) => acc + c.lessons.length, 0) : 0;
    const completedLessons = Object.keys(progress).length;
    const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    if (loading || !course) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#2AB7CA] border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground">Loading your curriculum...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B0C10] text-slate-50 selection:bg-[#2AB7CA]/30">
            <Header />

            <main className="pt-32 pb-24 px-6 max-w-5xl mx-auto">
                {/* Hero Section */}
                <section className="mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[0.9]">
                            {course.title}
                        </h1>
                        <div className="flex flex-wrap gap-6 text-slate-400 text-sm font-medium">
                            <div className="flex items-center gap-2">
                                <Layout size={16} className="text-[#2AB7CA]" />
                                {course.chapters.length} Chapters
                            </div>
                            <div className="flex items-center gap-2">
                                <BookOpen size={16} className="text-[#FED766]" />
                                {course.chapters.reduce((acc, c) => acc + c.lessons.length, 0)} Lessons
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock size={16} className="text-amber-400" />
                                ~4 hours total
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Syllabus List */}
                    <div className="lg:col-span-2 space-y-8">
                        {course.chapters.map((chapter, chapterIdx) => (
                            <motion.div
                                key={chapter.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: chapterIdx * 0.1 }}
                                className="group"
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center font-bold text-slate-400 group-hover:border-[#2AB7CA]/50 transition-colors">
                                        {chapterIdx + 1}
                                    </div>
                                    <h2 className="text-2xl font-bold tracking-tight">{chapter.title}</h2>
                                </div>

                                <div className="space-y-3 ml-14">
                                    {chapter.lessons.map((lesson, lessonIdx) => {
                                        const isCompleted = progress[lesson];
                                        // A lesson is unlocked if it's the first one, or the previous one is completed
                                        // In this MVP, we check the global absolute index of the lesson
                                        const prevLessonTitle = chapterIdx > 0 || lessonIdx > 0
                                            ? (lessonIdx > 0 ? chapter.lessons[lessonIdx - 1] : course.chapters[chapterIdx - 1].lessons[course.chapters[chapterIdx - 1].lessons.length - 1])
                                            : null;
                                        const isUnlocked = !prevLessonTitle || progress[prevLessonTitle];

                                        return (
                                            <div
                                                key={lessonIdx}
                                                onClick={() => {
                                                    if (isUnlocked) {
                                                        router.push(`/course/${course.course_id}/lesson/${encodeURIComponent(lesson)}`);
                                                    }
                                                }}
                                                className={cn(
                                                    "glass-dark border border-white/5 rounded-2xl p-4 flex items-center justify-between group/lesson transition-all",
                                                    isUnlocked ? "hover:bg-white/5 cursor-pointer" : "opacity-50 cursor-not-allowed grayscale"
                                                )}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                                                        isCompleted ? "bg-[#FED766]/20 text-[#FED766]" :
                                                            isUnlocked ? "bg-slate-800 text-slate-500 group-hover/lesson:bg-[#2AB7CA]/20 group-hover/lesson:text-[#2AB7CA]" :
                                                                "bg-slate-900 text-slate-700"
                                                    )}>
                                                        {isCompleted ? <CheckCircle2 size={20} /> : isUnlocked ? <PlayCircle size={20} /> : <Lock size={18} />}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className={cn(
                                                            "font-medium transition-colors",
                                                            isUnlocked ? "text-slate-300 group-hover/lesson:text-white" : "text-slate-600"
                                                        )}>
                                                            {lesson}
                                                        </span>
                                                        {!isUnlocked && <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mt-0.5">Quiz Required to Unlock</span>}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {isUnlocked ? (
                                                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 group-hover/lesson:bg-[#2AB7CA] text-slate-400 group-hover/lesson:text-white border border-white/10 transition-all">
                                                            <span className="text-xs font-bold uppercase tracking-wider">
                                                                {isCompleted ? 'Review' : 'Start'}
                                                            </span>
                                                            <ChevronRight size={14} />
                                                        </div>
                                                    ) : (
                                                        <Lock size={14} className="text-slate-800 mr-4" />
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        <div className="glass-dark border border-[#2AB7CA]/20 rounded-3xl p-8 space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <Award size={24} className="text-[#2AB7CA]" />
                                <h3 className="font-bold text-xl">Learning Progress</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#2AB7CA] transition-all duration-1000"
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                                    <span>{progressPercent}% Complete</span>
                                    <span>{completedLessons}/{totalLessons} Lessons</span>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    // Find first uncompleted lesson
                                    for (const chapter of course.chapters) {
                                        for (const lesson of chapter.lessons) {
                                            if (!progress[lesson]) {
                                                router.push(`/course/${course.course_id}/lesson/${encodeURIComponent(lesson)}`);
                                                return;
                                            }
                                        }
                                    }
                                    // If all complete, just go to first
                                    router.push(`/course/${course.course_id}/lesson/${encodeURIComponent(course.chapters[0].lessons[0])}`);
                                }}
                                className="w-full bg-[#2AB7CA] hover:bg-indigo-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-[#2AB7CA]/20 mt-4"
                            >
                                {completedLessons === 0 ? 'Start Learning' : 'Resume Lab'}
                            </button>
                        </div>

                        <div className="glass p-8 rounded-3xl space-y-4">
                            <h4 className="font-bold">Next Milestone</h4>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Complete the first 3 lessons to unlock the dynamic knowledge graph and earn your first proficiency badge.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

        </div>
    );
}
