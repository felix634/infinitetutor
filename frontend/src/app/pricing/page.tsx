'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Check, Sparkles, Zap, Crown, ArrowRight,
    BookOpen, Brain, Trophy, Star, Shield
} from 'lucide-react';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

type BillingCycle = 'monthly' | 'yearly';

const plans = [
    {
        name: 'Free',
        description: 'Perfect for trying out InfiniteTutor',
        monthlyPrice: 0,
        yearlyPrice: 0,
        features: [
            '3 courses per month',
            'Basic AI-generated content',
            'Standard lesson quality',
            'Community support',
            'Basic progress tracking'
        ],
        cta: 'Get Started',
        popular: false,
        gradient: 'from-slate-500 to-slate-600'
    },
    {
        name: 'Pro',
        description: 'For serious learners ready to master anything',
        monthlyPrice: 10,
        yearlyPrice: 100,
        features: [
            'Unlimited courses',
            'Advanced AI curriculum generation',
            'Premium lesson quality',
            'Priority support',
            'Detailed analytics & insights',
            'Custom learning paths',
            'Exclusive badges & titles',
            'Offline access (coming soon)'
        ],
        cta: 'Start Pro Trial',
        popular: true,
        gradient: 'from-indigo-500 to-emerald-500'
    }
];

const testimonials = [
    {
        quote: "InfiniteTutor helped me learn quantum mechanics in just 2 weeks. The AI-generated curriculum was perfect for my level.",
        author: "Sarah Chen",
        role: "Physics Student",
        avatar: "S"
    },
    {
        quote: "I've tried countless learning platforms. This is the first one that actually adapts to how I learn.",
        author: "Michael Roberts",
        role: "Software Engineer",
        avatar: "M"
    },
    {
        quote: "The badge system keeps me motivated. I'm now an 'Expert Historian' after completing 5 courses!",
        author: "Emma Wilson",
        role: "History Enthusiast",
        avatar: "E"
    }
];

export default function PricingPage() {
    const router = useRouter();
    const [billingCycle, setBillingCycle] = useState<BillingCycle>('yearly');

    const savings = plans[1].monthlyPrice * 12 - plans[1].yearlyPrice;

    return (
        <div className="min-h-screen bg-[#020617] text-slate-50">
            <Header />

            {/* Hero Section */}
            <section className="pt-32 pb-16 px-6 relative overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[150px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[150px]" />

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8">
                            <Crown size={14} />
                            <span>Simple, Transparent Pricing</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
                            Invest in Your <span className="bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">Growth</span>
                        </h1>

                        <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-12">
                            Choose the plan that fits your learning journey. Cancel anytime.
                        </p>

                        {/* Billing Toggle */}
                        <div className="inline-flex items-center gap-4 p-2 bg-white/5 rounded-2xl border border-white/10">
                            <button
                                onClick={() => setBillingCycle('monthly')}
                                className={cn(
                                    "px-6 py-3 rounded-xl font-bold transition-all",
                                    billingCycle === 'monthly'
                                        ? "bg-white text-black"
                                        : "text-slate-400 hover:text-white"
                                )}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setBillingCycle('yearly')}
                                className={cn(
                                    "px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2",
                                    billingCycle === 'yearly'
                                        ? "bg-gradient-to-r from-indigo-500 to-emerald-500 text-white"
                                        : "text-slate-400 hover:text-white"
                                )}
                            >
                                Yearly
                                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                                    Save ${savings}
                                </span>
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="py-12 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-8">
                        {plans.map((plan, index) => (
                            <motion.div
                                key={plan.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={cn(
                                    "relative glass-dark rounded-[2.5rem] p-8 md:p-10",
                                    plan.popular
                                        ? "border-2 border-indigo-500/50"
                                        : "border border-white/5"
                                )}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <div className="bg-gradient-to-r from-indigo-500 to-emerald-500 text-white text-sm font-bold px-4 py-1.5 rounded-full flex items-center gap-2">
                                            <Star size={14} fill="white" />
                                            Most Popular
                                        </div>
                                    </div>
                                )}

                                <div className="mb-8">
                                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                    <p className="text-slate-400">{plan.description}</p>
                                </div>

                                <div className="mb-8">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-black">
                                            ${billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                                        </span>
                                        <span className="text-slate-400">
                                            /{billingCycle === 'monthly' ? 'month' : 'year'}
                                        </span>
                                    </div>
                                    {billingCycle === 'yearly' && plan.yearlyPrice > 0 && (
                                        <p className="text-sm text-emerald-400 mt-2">
                                            That's just ${Math.round(plan.yearlyPrice / 12)}/month
                                        </p>
                                    )}
                                </div>

                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-5 h-5 rounded-full flex items-center justify-center",
                                                plan.popular ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-white"
                                            )}>
                                                <Check size={12} />
                                            </div>
                                            <span className="text-slate-300">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => router.push(plan.monthlyPrice === 0 ? '/' : '/login')}
                                    className={cn(
                                        "w-full font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2",
                                        plan.popular
                                            ? "bg-gradient-to-r from-indigo-500 to-emerald-500 hover:from-indigo-600 hover:to-emerald-600 text-white shadow-xl shadow-indigo-500/20"
                                            : "bg-white/5 hover:bg-white/10 border border-white/10 text-white"
                                    )}
                                >
                                    {plan.cta}
                                    <ArrowRight size={18} />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Comparison */}
            <section className="py-20 px-6 border-t border-white/5">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl font-black mb-4">Everything You Get with Pro</h2>
                        <p className="text-slate-400 mb-12">Unlock your full learning potential</p>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {[
                            { icon: BookOpen, title: 'Unlimited Courses', desc: 'Learn as much as you want' },
                            { icon: Brain, title: 'Advanced AI', desc: 'Premium content generation' },
                            { icon: Trophy, title: 'Exclusive Badges', desc: 'Earn rare achievements' },
                            { icon: Zap, title: 'Priority Support', desc: '24/7 assistance' },
                            { icon: Shield, title: 'Offline Access', desc: 'Learn anywhere (soon)' },
                            { icon: Sparkles, title: 'Early Features', desc: 'First access to new tools' }
                        ].map((item, index) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                className="glass-dark border border-white/5 rounded-2xl p-6 text-left"
                            >
                                <item.icon className="text-indigo-400 mb-4" size={24} />
                                <h3 className="font-bold mb-1">{item.title}</h3>
                                <p className="text-sm text-slate-400">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 px-6">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-black mb-4">Loved by Learners</h2>
                        <p className="text-slate-400">Join thousands mastering new skills</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {testimonials.map((testimonial, index) => (
                            <motion.div
                                key={testimonial.author}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="glass-dark border border-white/5 rounded-[2rem] p-8"
                            >
                                <p className="text-slate-300 mb-6 leading-relaxed">"{testimonial.quote}"</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center font-bold text-white">
                                        {testimonial.avatar}
                                    </div>
                                    <div>
                                        <p className="font-bold">{testimonial.author}</p>
                                        <p className="text-sm text-slate-500">{testimonial.role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ / CTA */}
            <section className="py-20 px-6 border-t border-white/5">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="glass-dark border border-emerald-500/20 rounded-[2.5rem] p-12 relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-emerald-500/10" />

                        <div className="relative z-10">
                            <h2 className="text-3xl font-black mb-4">Start Learning Today</h2>
                            <p className="text-slate-400 mb-8">
                                Try Pro free for 7 days. No credit card required.
                            </p>
                            <button
                                onClick={() => router.push('/login')}
                                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-emerald-500 hover:from-indigo-600 hover:to-emerald-600 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-xl shadow-indigo-500/20"
                            >
                                Start Free Trial
                                <ArrowRight size={18} />
                            </button>
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
