'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    Sparkles, BookOpen, Brain, Zap, Target,
    ChevronRight, CheckCircle2, ArrowRight,
    Lightbulb, Layers, Trophy
} from 'lucide-react';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';

const steps = [
    {
        number: '01',
        title: 'Tell Us What You Want to Learn',
        description: 'Enter any topic—from quantum physics to Renaissance art. Specify your current level and how much time you can dedicate.',
        icon: Lightbulb,
        gradient: 'from-indigo-500 to-purple-500'
    },
    {
        number: '02',
        title: 'AI Generates Your Curriculum',
        description: 'Our advanced AI creates a structured, personalized syllabus with chapters, lessons, and visual diagrams tailored to your level.',
        icon: Brain,
        gradient: 'from-purple-500 to-pink-500'
    },
    {
        number: '03',
        title: 'Learn at Your Own Pace',
        description: 'Work through interactive lessons with rich content, Mermaid.js visualizations, and AI-generated explanations.',
        icon: BookOpen,
        gradient: 'from-pink-500 to-rose-500'
    },
    {
        number: '04',
        title: 'Test Your Knowledge',
        description: 'Complete quizzes after each lesson to reinforce learning. Score 4/6 or higher to unlock the next lesson.',
        icon: Target,
        gradient: 'from-rose-500 to-orange-500'
    },
    {
        number: '05',
        title: 'Earn Badges & Titles',
        description: 'Complete courses to earn exclusive badges and titles like "Expert Mathematician" or "Master Developer".',
        icon: Trophy,
        gradient: 'from-orange-500 to-amber-500'
    }
];

const features = [
    {
        title: 'Infinite Topics',
        description: 'Learn anything from niche hobbies to advanced sciences—no topic is too obscure.',
        icon: Sparkles
    },
    {
        title: 'Adaptive Difficulty',
        description: 'Content adjusts to your level—beginner, intermediate, advanced, or expert.',
        icon: Layers
    },
    {
        title: 'Visual Learning',
        description: 'Every lesson includes dynamic diagrams and visualizations to cement understanding.',
        icon: Zap
    }
];

export default function HowItWorksPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[#020617] text-slate-50">
            <Header />

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6 relative overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[150px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[150px]" />

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-8">
                            <Sparkles size={14} />
                            <span>How InfiniteTutor Works</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
                            Master Anything in <span className="bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">5 Simple Steps</span>
                        </h1>

                        <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                            From topic selection to earning your title, here's how you'll transform into an expert.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Steps Section */}
            <section className="py-20 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="space-y-8">
                        {steps.map((step, index) => (
                            <motion.div
                                key={step.number}
                                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="relative"
                            >
                                <div className="glass-dark border border-white/5 rounded-[2rem] p-8 md:p-12 flex flex-col md:flex-row gap-8 items-start group hover:border-indigo-500/20 transition-all">
                                    {/* Step Number */}
                                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                                        <step.icon className="text-white" size={36} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-4">
                                            <span className={`text-5xl font-black bg-gradient-to-r ${step.gradient} bg-clip-text text-transparent opacity-50`}>
                                                {step.number}
                                            </span>
                                            <h3 className="text-2xl md:text-3xl font-bold">
                                                {step.title}
                                            </h3>
                                        </div>
                                        <p className="text-lg text-slate-400 leading-relaxed">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Connector Line */}
                                {index < steps.length - 1 && (
                                    <div className="hidden md:block absolute left-[3.5rem] top-full w-0.5 h-8 bg-gradient-to-b from-white/10 to-transparent" />
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 px-6 border-t border-white/5">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl font-black mb-4">Why InfiniteTutor?</h2>
                        <p className="text-xl text-slate-400">The future of personalized learning, powered by AI.</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="glass-dark border border-white/5 rounded-[2rem] p-8 text-center group hover:border-indigo-500/20 transition-all"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                    <feature.icon className="text-indigo-400" size={32} />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-slate-400">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6">
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="glass-dark border border-indigo-500/20 rounded-[2.5rem] p-12 text-center relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-emerald-500/10" />

                        <div className="relative z-10">
                            <h2 className="text-4xl font-black mb-4">Ready to Start Learning?</h2>
                            <p className="text-xl text-slate-400 mb-8 max-w-xl mx-auto">
                                Join thousands of learners mastering new skills with AI-powered curricula.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    onClick={() => router.push('/')}
                                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-emerald-500 hover:from-indigo-600 hover:to-emerald-600 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-xl shadow-indigo-500/20"
                                >
                                    Start Learning Free
                                    <ArrowRight size={18} />
                                </button>
                                <button
                                    onClick={() => router.push('/pricing')}
                                    className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold px-8 py-4 rounded-2xl transition-all"
                                >
                                    View Pricing
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-white/5 text-center text-slate-500 text-sm">
                <p>© 2026 InfiniteTutor. Built for the curious.</p>
            </footer>
        </div>
    );
}
