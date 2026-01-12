'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, Loader2, Sparkles, CheckCircle2, KeyRound, Lock, Eye, EyeOff } from 'lucide-react';

type Step = 'auth' | 'verify';
type Mode = 'login' | 'register';

export default function LoginPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>('auth');
    const [mode, setMode] = useState<Mode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (mode === 'login') {
                // Direct login
                const response = await fetch('http://localhost:8000/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.detail || 'Login failed');
                }

                localStorage.setItem('auth_token', data.token);
                localStorage.setItem('user_email', email);
                router.push('/dashboard');
            } else {
                // Register - send verification code
                const response = await fetch('http://localhost:8000/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.detail || 'Registration failed');
                }

                setMessage('Check your email for the verification code!');
                setStep('verify');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:8000/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Verification failed');
            }

            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('user_email', email);
            router.push('/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col relative overflow-hidden">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 px-6 py-4">
                <button
                    onClick={() => router.push('/')}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-emerald-500 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
                        <Sparkles size={20} />
                    </div>
                    <span className="text-xl font-black tracking-tight text-white">InfiniteTutor</span>
                </button>
            </header>

            <div className="flex-1 flex items-center justify-center px-6">
                {/* Background Effects */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[150px]" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[150px]" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md relative z-10"
                >
                    {/* Logo */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center">
                                <Sparkles className="text-white" size={24} />
                            </div>
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tight">
                            {step === 'auth'
                                ? (mode === 'login' ? 'Welcome Back!' : 'Create Account')
                                : 'Verify Email'
                            }
                        </h1>
                        <p className="text-slate-400 mt-3">
                            {step === 'auth'
                                ? (mode === 'login' ? 'Log in to continue your learning' : 'Start your personalized learning journey')
                                : 'Enter the code we sent to your email'
                            }
                        </p>
                    </div>

                    {/* Card */}
                    <div className="glass-dark border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
                        <AnimatePresence mode="wait">
                            {step === 'auth' ? (
                                <motion.form
                                    key="auth"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    onSubmit={handleAuth}
                                    className="space-y-6"
                                >
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
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
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
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
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
                                        className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
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
                            ) : (
                                <motion.form
                                    key="verify"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    onSubmit={handleVerify}
                                    className="space-y-6"
                                >
                                    {message && (
                                        <div className="flex items-center gap-3 text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                                            <CheckCircle2 size={20} />
                                            <span>{message}</span>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Verification Code</label>
                                        <div className="relative">
                                            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                                            <input
                                                type="text"
                                                value={code}
                                                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                placeholder="Enter 6-digit code"
                                                required
                                                maxLength={6}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-center text-2xl tracking-[0.5em] font-mono placeholder:text-slate-500 placeholder:tracking-normal placeholder:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                                            {error}
                                        </p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading || code.length !== 6}
                                        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <Loader2 className="animate-spin" size={20} />
                                        ) : (
                                            <>
                                                Verify & Continue
                                                <ArrowRight size={18} />
                                            </>
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setStep('auth');
                                            setCode('');
                                            setError('');
                                            setMessage('');
                                        }}
                                        className="w-full text-slate-400 hover:text-white text-sm transition-colors"
                                    >
                                        ← Back
                                    </button>
                                </motion.form>
                            )}
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

