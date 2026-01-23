'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Sparkles, Brain, Clock, Target } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { api, getSupabaseHeaders } from '@/lib/api';
import { supabase } from '@/lib/supabase';

type Step = 'topic' | 'level' | 'time';

interface FormData {
    topic: string;
    level: string;
    daily_minutes: number;
}

export default function IntakeWizard() {
    const [step, setStep] = useState<Step>('topic');
    const [formData, setFormData] = useState<FormData>({
        topic: '',
        level: 'Beginner',
        daily_minutes: 30,
    });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Check for suggested topic from dashboard and pre-fill
    useEffect(() => {
        const suggestedTopic = localStorage.getItem('suggested_topic');
        if (suggestedTopic) {
            setFormData(prev => ({ ...prev, topic: suggestedTopic }));
            // Clear it so it doesn't persist on page refresh
            localStorage.removeItem('suggested_topic');
        }
    }, []);

    const steps: Step[] = ['topic', 'level', 'time'];
    const currentIndex = steps.indexOf(step);

    const next = () => {
        if (currentIndex < steps.length - 1) {
            setStep(steps[currentIndex + 1]);
        } else {
            handleSubmit();
        }
    };

    const prev = () => {
        if (currentIndex > 0) {
            setStep(steps[currentIndex - 1]);
        }
    };

    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(api.generateSyllabus, {
                method: 'POST',
                headers: getSupabaseHeaders(),
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();

            if (!data || !data.course_id) {
                throw new Error('Invalid response from server');
            }

            console.log('Syllabus generated:', data);

            // Save to localStorage for the dashboard to pick up
            localStorage.setItem('current_course', JSON.stringify({
                ...data,
                topic: formData.topic,
                level: formData.level
            }));

            // If user is logged in, save course to their profile
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.access_token) {
                try {
                    console.log('Saving course to profile with Supabase token');
                    const saveResponse = await fetch(api.saveCourse, {
                        method: 'POST',
                        headers: getSupabaseHeaders(session.access_token),
                        body: JSON.stringify({
                            course_id: data.course_id,
                            title: data.title,
                            topic: formData.topic,
                            level: formData.level,
                            progress_percent: 0,
                            chapters: data.chapters || []
                        }),
                    });

                    if (saveResponse.ok) {
                        console.log('✅ Course saved to profile successfully');
                    } else {
                        const errorData = await saveResponse.text();
                        console.error('❌ Failed to save course:', saveResponse.status, errorData);
                    }
                } catch (err) {
                    console.error('❌ Error saving course to profile:', err);
                }
            } else {
                console.log('No Supabase session - course saved to localStorage only');
            }

            // Navigate to the course page
            router.push(`/course/${data.course_id}`);
        } catch (err) {
            console.error('Error generating syllabus:', err);
            setError(err instanceof Error ? err.message : 'Failed to generate syllabus. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 50 : -50,
            opacity: 0,
        }),
    };

    const direction = 1; // Simplified for now

    return (
        <div className="w-full max-w-xl mx-auto">
            <div className="glass-dark rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                    <motion.div
                        className="h-full bg-gradient-to-r from-[#2AB7CA] to-[#FED766]"
                        initial={{ width: '0%' }}
                        animate={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
                    />
                </div>

                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={step}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="space-y-8"
                    >
                        {step === 'topic' && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-[#2AB7CA] mb-2">
                                        <Brain size={20} />
                                        <span className="text-sm font-medium tracking-wider uppercase">Step 1: The Vision</span>
                                    </div>
                                    <h2 className="text-3xl font-bold">What do you want to master?</h2>
                                    <p className="text-muted-foreground">Quantum physics, sourdough baking, or ancient history—the choice is yours.</p>
                                </div>
                                <input
                                    type="text"
                                    placeholder="e.g. Molecular Gastronomy"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-xl focus:outline-none focus:ring-2 focus:ring-[#2AB7CA] transition-all"
                                    value={formData.topic}
                                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                    autoFocus
                                />
                            </div>
                        )}

                        {step === 'level' && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-[#FED766] mb-2">
                                        <Target size={20} />
                                        <span className="text-sm font-medium tracking-wider uppercase">Step 2: Expertise</span>
                                    </div>
                                    <h2 className="text-3xl font-bold">Your current level?</h2>
                                    <p className="text-muted-foreground">We&apos;ll tailor the complexity to your background.</p>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map((l) => (
                                        <button
                                            key={l}
                                            onClick={() => setFormData({ ...formData, level: l })}
                                            className={cn(
                                                "w-full text-left px-6 py-4 rounded-xl border transition-all flex items-center justify-between group",
                                                formData.level === l
                                                    ? "bg-[#2AB7CA]/20 border-[#2AB7CA]/50 text-[#2AB7CA]"
                                                    : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                                            )}
                                        >
                                            <span className="text-lg font-medium">{l}</span>
                                            <div className={cn(
                                                "w-4 h-4 rounded-full border-2 transition-all",
                                                formData.level === l ? "bg-[#2AB7CA] border-[#2AB7CA]" : "border-white/20"
                                            )} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 'time' && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-[#2AB7CA] mb-2">
                                        <Clock size={20} />
                                        <span className="text-sm font-medium tracking-wider uppercase">Step 3: Commitment</span>
                                    </div>
                                    <h2 className="text-3xl font-bold">Daily time investment?</h2>
                                    <p className="text-muted-foreground">Tell us how much time you can dedicate each day.</p>
                                </div>
                                <div className="space-y-8">
                                    <div className="flex justify-between items-end">
                                        <span className="text-5xl font-bold text-[#FED766]">{formData.daily_minutes}</span>
                                        <span className="text-xl text-muted-foreground mb-1">minutes / day</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="15"
                                        max="120"
                                        step="15"
                                        value={formData.daily_minutes}
                                        onChange={(e) => setFormData({ ...formData, daily_minutes: parseInt(e.target.value) })}
                                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#2AB7CA]"
                                    />
                                    <div className="flex justify-between text-xs text-muted-foreground uppercase tracking-widest">
                                        <span>15m (Bite-sized)</span>
                                        <span>120m (Deep Dive)</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Error message display */}
                {error && (
                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold">⚠️ Error</span>
                        </div>
                        <p>{error}</p>
                    </div>
                )}

                <div className="mt-12 flex items-center justify-between">
                    <button
                        onClick={prev}
                        disabled={currentIndex === 0}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-medium",
                            currentIndex === 0 ? "opacity-0 pointer-events-none" : "hover:bg-white/5 text-muted-foreground"
                        )}
                    >
                        <ChevronLeft size={20} />
                        Back
                    </button>

                    <button
                        onClick={next}
                        disabled={loading || (step === 'topic' && !formData.topic)}
                        className="flex items-center gap-2 bg-gradient-to-r from-[#2AB7CA] to-[#FED766] text-[#0B0C10] px-8 py-3 rounded-xl hover:opacity-90 transition-all font-bold shadow-xl shadow-[#2AB7CA]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                Generating...
                            </span>
                        ) : (
                            <>
                                {currentIndex === steps.length - 1 ? 'Generate Syllabus' : 'Continue'}
                                {currentIndex !== steps.length - 1 && <ChevronRight size={20} />}
                                {currentIndex === steps.length - 1 && <Sparkles size={18} className="text-[#0B0C10]" />}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
