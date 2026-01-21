'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, Plus, ChevronRight,
    Loader2, Clock, TrendingUp, Lightbulb, GraduationCap,
    BarChart3, Trophy, Medal, Star, Flame, Zap, Crown,
    Award, Target, Rocket, Brain, Gem, Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Header from '@/components/Header';
import StatsWidget from '@/components/StatsWidget';
import { api, getSupabaseHeaders } from '@/lib/api';
import { supabase } from '@/lib/supabase';

interface Course {
    course_id: string;
    title: string;
    topic: string;
    level: string;
    progress_percent: number;
    last_accessed: string;
}

interface Suggestion {
    title: string;
    description: string;
}

type Tab = 'progress' | 'achievements';

// Creative badge configurations based on topic keywords
const getBadgeConfig = (topic: string, level: string) => {
    const topicLower = topic.toLowerCase();

    // Icon based on topic
    let Icon = Award;
    let gradient = 'from-[#2AB7CA] to-purple-500';
    let category = 'Scholar';

    if (topicLower.includes('math') || topicLower.includes('calcul') || topicLower.includes('algebra')) {
        Icon = Brain;
        gradient = 'from-blue-500 to-cyan-500';
        category = 'Mathematician';
    } else if (topicLower.includes('science') || topicLower.includes('physics') || topicLower.includes('chemistry')) {
        Icon = Zap;
        gradient = 'from-yellow-500 to-orange-500';
        category = 'Scientist';
    } else if (topicLower.includes('history') || topicLower.includes('ancient') || topicLower.includes('civiliz')) {
        Icon = Shield;
        gradient = 'from-amber-600 to-yellow-500';
        category = 'Historian';
    } else if (topicLower.includes('art') || topicLower.includes('design') || topicLower.includes('creative')) {
        Icon = Gem;
        gradient = 'from-pink-500 to-rose-500';
        category = 'Artist';
    } else if (topicLower.includes('code') || topicLower.includes('program') || topicLower.includes('software') || topicLower.includes('python') || topicLower.includes('javascript')) {
        Icon = Rocket;
        gradient = 'from-[#FED766] to-teal-500';
        category = 'Developer';
    } else if (topicLower.includes('business') || topicLower.includes('marketing') || topicLower.includes('finance')) {
        Icon = Target;
        gradient = 'from-green-500 to-[#FED766]';
        category = 'Strategist';
    } else if (topicLower.includes('language') || topicLower.includes('english') || topicLower.includes('spanish') || topicLower.includes('french')) {
        Icon = Star;
        gradient = 'from-violet-500 to-purple-500';
        category = 'Linguist';
    } else if (topicLower.includes('music') || topicLower.includes('instrument') || topicLower.includes('piano')) {
        Icon = Flame;
        gradient = 'from-red-500 to-orange-500';
        category = 'Virtuoso';
    } else if (topicLower.includes('cook') || topicLower.includes('cuisine') || topicLower.includes('food') || topicLower.includes('bak')) {
        Icon = Medal;
        gradient = 'from-orange-500 to-amber-500';
        category = 'Chef';
    } else if (topicLower.includes('invent') || topicLower.includes('vinci') || topicLower.includes('engineer')) {
        Icon = Crown;
        gradient = 'from-[#2AB7CA] to-blue-500';
        category = 'Inventor';
    }

    // Level prefix
    let levelPrefix = '';
    if (level.toLowerCase() === 'beginner') levelPrefix = 'Aspiring';
    else if (level.toLowerCase() === 'intermediate') levelPrefix = 'Proficient';
    else if (level.toLowerCase() === 'advanced') levelPrefix = 'Expert';
    else if (level.toLowerCase() === 'expert') levelPrefix = 'Master';
    else levelPrefix = 'Certified';

    return {
        Icon,
        gradient,
        title: `${levelPrefix} ${category}`,
        category
    };
};

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<{ email: string } | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('progress');

    const inProgressCourses = courses.filter(c => c.progress_percent < 100);
    const completedCourses = courses.filter(c => c.progress_percent >= 100);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            router.push('/login');
            return;
        }

        setUser({ email: session.user.email || '' });
        await fetchCourses();
        await fetchSuggestions();
        setLoading(false);
    };

    const fetchCourses = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const response = await fetch(api.courses, {
                headers: getSupabaseHeaders(session.access_token),
            });

            if (response.ok) {
                const data = await response.json();
                // Edge Function returns array directly, not {courses: [...]}
                setCourses(Array.isArray(data) ? data : (data.courses || []));
            }
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        }
    };

    const fetchSuggestions = async () => {
        setLoadingSuggestions(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const response = await fetch(api.suggestions, {
                headers: getSupabaseHeaders(session.access_token),
            });

            if (response.ok) {
                const data = await response.json();
                // Edge Function returns array directly
                setSuggestions(Array.isArray(data) ? data : (data.suggestions || []));
            }
        } catch (error) {
            console.error('Failed to fetch suggestions:', error);
        } finally {
            setLoadingSuggestions(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('user_email');
        localStorage.removeItem('current_course');
        window.location.href = '/login';
    };

    const handleStartCourse = (suggestion: Suggestion) => {
        localStorage.setItem('suggested_topic', suggestion.title);
        router.push('/');
    };

    const handleContinueCourse = (course: Course) => {
        localStorage.setItem('current_course', JSON.stringify({
            course_id: course.course_id,
            title: course.title,
            topic: course.topic,
            chapters: []
        }));
        router.push(`/course/${course.course_id}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center">
                <div className="flex flex-col items-center gap-6">
                    <div className="w-16 h-16 border-4 border-[#2AB7CA] border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 font-medium animate-pulse">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B0C10] text-slate-50">
            <Header />

            <main className="pt-28 pb-16 px-6 max-w-7xl mx-auto">
                {/* Welcome Section */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-black tracking-tight mb-2">
                        Welcome back! 👋
                    </h1>
                    <p className="text-xl text-slate-400">
                        {activeTab === 'progress'
                            ? 'Continue your learning journey or explore something new.'
                            : 'Celebrate your achievements and earned titles!'
                        }
                    </p>
                </motion.section>

                {/* Stats Widget */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8"
                >
                    <StatsWidget />
                </motion.section>

                {/* Tabs */}
                <div className="flex gap-2 mb-8 p-1.5 bg-white/5 rounded-2xl w-fit">
                    <button
                        onClick={() => setActiveTab('progress')}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all",
                            activeTab === 'progress'
                                ? "bg-[#2AB7CA] text-white shadow-lg shadow-[#2AB7CA]/20"
                                : "text-slate-400 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <BookOpen size={18} />
                        In Progress
                        {inProgressCourses.length > 0 && (
                            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                                {inProgressCourses.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('achievements')}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all",
                            activeTab === 'achievements'
                                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/20"
                                : "text-slate-400 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <Trophy size={18} />
                        Achievements
                        {completedCourses.length > 0 && (
                            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                                {completedCourses.length}
                            </span>
                        )}
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'progress' ? (
                        <motion.div
                            key="progress"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid lg:grid-cols-3 gap-8"
                        >
                            {/* Main Content - Courses */}
                            <div className="lg:col-span-2 space-y-8">
                                <section>
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <BookOpen className="text-[#2AB7CA]" size={24} />
                                            <h2 className="text-2xl font-bold">My Courses</h2>
                                        </div>
                                        <button
                                            onClick={() => router.push('/')}
                                            className="flex items-center gap-2 text-sm font-medium text-[#2AB7CA] hover:text-[#2AB7CA] transition-colors"
                                        >
                                            <Plus size={16} />
                                            New Course
                                        </button>
                                    </div>

                                    {inProgressCourses.length === 0 ? (
                                        <div className="glass-dark border border-white/5 rounded-[2rem] p-12 text-center">
                                            <div className="w-20 h-20 rounded-full bg-[#2AB7CA]/10 flex items-center justify-center mx-auto mb-6">
                                                <GraduationCap className="text-[#2AB7CA]" size={40} />
                                            </div>
                                            <h3 className="text-xl font-bold mb-2">No courses in progress</h3>
                                            <p className="text-slate-400 mb-6">
                                                Start a new course to begin your learning journey!
                                            </p>
                                            <button
                                                onClick={() => router.push('/')}
                                                className="inline-flex items-center gap-2 bg-[#2AB7CA] hover:bg-[#2AB7CA] text-white font-bold px-6 py-3 rounded-xl transition-all"
                                            >
                                                <Plus size={18} />
                                                Create Your First Course
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {inProgressCourses.map((course, index) => (
                                                <motion.div
                                                    key={course.course_id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    onClick={() => handleContinueCourse(course)}
                                                    className="glass-dark border border-white/5 rounded-2xl p-6 hover:border-[#2AB7CA]/30 transition-all cursor-pointer group"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <h3 className="text-lg font-bold group-hover:text-[#2AB7CA] transition-colors">
                                                                {course.title}
                                                            </h3>
                                                            <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                                                                <span className="flex items-center gap-1">
                                                                    <BarChart3 size={14} />
                                                                    {course.level}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Clock size={14} />
                                                                    {new Date(course.last_accessed).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-4">
                                                            <div className="relative w-14 h-14">
                                                                <svg className="w-full h-full -rotate-90">
                                                                    <circle
                                                                        cx="28"
                                                                        cy="28"
                                                                        r="24"
                                                                        stroke="rgba(255,255,255,0.1)"
                                                                        strokeWidth="4"
                                                                        fill="none"
                                                                    />
                                                                    <circle
                                                                        cx="28"
                                                                        cy="28"
                                                                        r="24"
                                                                        stroke="url(#progressGradient)"
                                                                        strokeWidth="4"
                                                                        fill="none"
                                                                        strokeLinecap="round"
                                                                        strokeDasharray={`${(course.progress_percent / 100) * 150.8} 150.8`}
                                                                    />
                                                                    <defs>
                                                                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                                            <stop offset="0%" stopColor="#2AB7CA" />
                                                                            <stop offset="100%" stopColor="#FED766" />
                                                                        </linearGradient>
                                                                    </defs>
                                                                </svg>
                                                                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                                                                    {course.progress_percent}%
                                                                </span>
                                                            </div>
                                                            <ChevronRight className="text-slate-500 group-hover:text-[#2AB7CA] group-hover:translate-x-1 transition-all" />
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </section>
                            </div>

                            {/* Sidebar - Suggestions */}
                            <aside className="space-y-6">
                                <div className="glass-dark border border-white/5 rounded-[2rem] p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-[#FED766]/20 flex items-center justify-center">
                                            <Lightbulb className="text-[#FED766]" size={20} />
                                        </div>
                                        <h2 className="text-lg font-bold">Suggested For You</h2>
                                    </div>

                                    {loadingSuggestions ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="animate-spin text-slate-400" size={24} />
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {suggestions.map((suggestion, index) => (
                                                <motion.button
                                                    key={index}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.3 + index * 0.1 }}
                                                    onClick={() => handleStartCourse(suggestion)}
                                                    className="w-full text-left p-4 rounded-xl bg-white/5 hover:bg-[#FED766]/10 border border-transparent hover:border-[#FED766]/20 transition-all group"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <TrendingUp className="text-[#FED766] mt-1 shrink-0" size={16} />
                                                        <div>
                                                            <h3 className="font-semibold group-hover:text-[#FED766] transition-colors">
                                                                {suggestion.title}
                                                            </h3>
                                                            <p className="text-sm text-slate-400 mt-1">
                                                                {suggestion.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </motion.button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Quick Stats */}
                                <div className="glass-dark border border-white/5 rounded-[2rem] p-6">
                                    <h3 className="text-lg font-bold mb-4">Quick Stats</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-400">In Progress</span>
                                            <span className="font-bold text-2xl">{inProgressCourses.length}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-400">Completed</span>
                                            <span className="font-bold text-2xl text-[#FED766]">{completedCourses.length}</span>
                                        </div>
                                    </div>
                                </div>
                            </aside>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="achievements"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            {completedCourses.length === 0 ? (
                                <div className="glass-dark border border-amber-500/20 rounded-[2rem] p-16 text-center max-w-2xl mx-auto">
                                    <div className="w-24 h-24 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-8">
                                        <Trophy className="text-amber-400" size={48} />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4">No achievements yet</h3>
                                    <p className="text-slate-400 mb-8 max-w-md mx-auto">
                                        Complete a course to earn your first badge and unlock an exclusive title!
                                    </p>
                                    <button
                                        onClick={() => setActiveTab('progress')}
                                        className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-bold px-8 py-4 rounded-xl transition-all"
                                    >
                                        Continue Learning
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {/* Achievement Summary */}
                                    <div className="glass-dark border border-amber-500/20 rounded-[2rem] p-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                                                <Crown className="text-white" size={40} />
                                            </div>
                                            <div>
                                                <h2 className="text-3xl font-black mb-1">
                                                    {completedCourses.length} {completedCourses.length === 1 ? 'Achievement' : 'Achievements'} Unlocked
                                                </h2>
                                                <p className="text-slate-400">
                                                    You've earned {completedCourses.length} exclusive {completedCourses.length === 1 ? 'title' : 'titles'}!
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Badges Grid */}
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {completedCourses.map((course, index) => {
                                            const badge = getBadgeConfig(course.topic, course.level);
                                            const BadgeIcon = badge.Icon;

                                            return (
                                                <motion.div
                                                    key={course.course_id}
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="glass-dark border border-white/10 rounded-[2rem] p-8 text-center group hover:border-amber-500/30 transition-all"
                                                >
                                                    {/* Badge */}
                                                    <div className="relative inline-block mb-6">
                                                        <div className={cn(
                                                            "w-24 h-24 rounded-2xl bg-gradient-to-br flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-transform",
                                                            badge.gradient
                                                        )}>
                                                            <BadgeIcon className="text-white" size={44} />
                                                        </div>
                                                        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center border-4 border-[#0B0C10]">
                                                            <Star className="text-white" size={16} fill="white" />
                                                        </div>
                                                    </div>

                                                    {/* Title */}
                                                    <h3 className={cn(
                                                        "text-xl font-black bg-gradient-to-r bg-clip-text text-transparent mb-2",
                                                        badge.gradient
                                                    )}>
                                                        {badge.title}
                                                    </h3>

                                                    {/* Course Name */}
                                                    <p className="text-sm text-slate-400 mb-4">
                                                        {course.title}
                                                    </p>

                                                    {/* Completion Date */}
                                                    <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                                                        <Award size={12} />
                                                        Earned {new Date(course.last_accessed).toLocaleDateString()}
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
