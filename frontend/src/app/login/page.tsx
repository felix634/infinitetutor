'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, Loader2, Sparkles, CheckCircle2, Lock, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Mode = 'login' | 'register';

export default function LoginPage() {
    const router = useRouter();
    const [mode, setMode] = useState<Mode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    // Check if already logged in; handle OAuth callback error
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('error') === 'auth_failed') {
            setError('Sign-in failed. Please try again.');
            window.history.replaceState({}, '', '/login');
        }
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                router.push('/dashboard');
            }
        });
    }, [router]);

    const handleOAuth = async (provider: 'google' | 'github') => {
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider,
                options: { redirectTo: `${window.location.origin}/auth/callback` },
            });
            if (error) throw error;
            if (data?.url) window.location.href = data.url;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'OAuth sign-in failed');
        } finally {
            setLoading(false);
        }
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            if (mode === 'login') {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) throw error;

                if (data.session) {
                    localStorage.setItem('user_email', email);
                    router.push('/dashboard');
                }
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    }
                });

                if (error) throw error;

                if (data.user && !data.session) {
                    // Email confirmation required
                    setMessage('Check your email for the confirmation link!');
                } else if (data.session) {
                    // Auto-confirmed (happens for existing users sometimes)
                    localStorage.setItem('user_email', email);
                    router.push('/dashboard');
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0C10] flex flex-col relative overflow-hidden">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 px-6 py-4">
                <button
                    onClick={() => router.push('/')}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                    <div className="w-10 h-10 bg-gradient-to-br from-[#2AB7CA] to-[#FED766] rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-[#2AB7CA]/20">
                        <Sparkles size={20} />
                    </div>
                    <span className="text-xl font-black tracking-tight text-white">InfiniteTutor</span>
                </button>
            </header>

            <div className="flex-1 flex items-center justify-center px-6">
                {/* Background Effects */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#2AB7CA]/20 rounded-full blur-[150px]" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FED766]/20 rounded-full blur-[150px]" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md relative z-10"
                >
                    {/* Logo */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2AB7CA] to-[#FED766] flex items-center justify-center">
                                <Sparkles className="text-white" size={24} />
                            </div>
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tight">
                            {mode === 'login' ? 'Welcome Back!' : 'Create Account'}
                        </h1>
                        <p className="text-slate-400 mt-3">
                            {mode === 'login' ? 'Log in to continue your learning' : 'Start your personalized learning journey'}
                        </p>
                    </div>

                    {/* Card */}
                    <div className="glass-dark border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
                        {/* OAuth */}
                        <div className="space-y-3 mb-6">
                            <button
                                type="button"
                                onClick={() => handleOAuth('google')}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl py-4 text-slate-200 font-medium transition-all disabled:opacity-50"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Continue with Google
                            </button>
                            <button
                                type="button"
                                onClick={() => handleOAuth('github')}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl py-4 text-slate-200 font-medium transition-all disabled:opacity-50"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                </svg>
                                Continue with GitHub
                            </button>
                        </div>

                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="bg-[#0f1419] px-4 text-slate-500">or continue with email</span>
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.form
                                key={mode}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onSubmit={handleAuth}
                                className="space-y-6"
                            >
                                {message && (
                                    <div className="flex items-center gap-3 text-[#FED766] text-sm bg-[#FED766]/10 border border-[#FED766]/20 rounded-xl p-4">
                                        <CheckCircle2 size={20} />
                                        <span>{message}</span>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#2AB7CA]/50 focus:border-[#2AB7CA] transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                            minLength={6}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#2AB7CA]/50 focus:border-[#2AB7CA] transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                {error && (
                                    <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                                        {error}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading || !email || !password}
                                    className="w-full bg-gradient-to-r from-[#2AB7CA] to-[#2AB7CA] hover:from-[#2AB7CA] hover:to-indigo-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-[#2AB7CA]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        <>
                                            {mode === 'login' ? 'Log In' : 'Create Account'}
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>

                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMode(mode === 'login' ? 'register' : 'login');
                                            setError('');
                                            setMessage('');
                                        }}
                                        className="text-slate-400 hover:text-white text-sm transition-colors"
                                    >
                                        {mode === 'login'
                                            ? "Don't have an account? Sign up"
                                            : "Already have an account? Log in"
                                        }
                                    </button>
                                </div>
                            </motion.form>
                        </AnimatePresence>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-slate-600 text-sm mt-8">
                        By continuing, you agree to our Terms of Service and Privacy Policy
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
