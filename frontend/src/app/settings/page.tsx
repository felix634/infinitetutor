'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    ArrowLeft, User, Bell, Shield, Moon, Sun,
    Globe, Trash2, LogOut, ChevronRight,
    Mail, Key, Palette, Volume2, Eye
} from 'lucide-react';
import Header from '@/components/Header';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

type Theme = 'dark' | 'light' | 'system';

interface SettingSection {
    title: string;
    icon: React.ElementType;
    items: SettingItem[];
}

interface SettingItem {
    label: string;
    description?: string;
    type: 'toggle' | 'select' | 'button' | 'link';
    value?: boolean;
    options?: string[];
    selectedOption?: string;
    danger?: boolean;
    onClick?: () => void;
}

export default function SettingsPage() {
    const router = useRouter();
    const [theme, setTheme] = useState<Theme>('dark');
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(true);
    const [weeklyDigest, setWeeklyDigest] = useState(false);
    const [soundEffects, setSoundEffects] = useState(true);
    const [animationsEnabled, setAnimationsEnabled] = useState(true);
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        const email = localStorage.getItem('user_email');
        if (!email) {
            router.push('/login');
            return;
        }
        setUserEmail(email);

        // Load saved preferences
        const savedTheme = localStorage.getItem('theme') as Theme;
        if (savedTheme) setTheme(savedTheme);
    }, [router]);

    const handleThemeChange = (newTheme: Theme) => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);

        // Apply theme to document
        if (newTheme === 'light') {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');
        } else {
            document.documentElement.classList.remove('light');
            document.documentElement.classList.add('dark');
        }
    };

    const handleLogout = async () => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            await fetch(api.logout, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
        }
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_email');
        router.push('/login');
    };

    const settings: SettingSection[] = [
        {
            title: 'Appearance',
            icon: Palette,
            items: []
        },
        {
            title: 'Notifications',
            icon: Bell,
            items: [
                {
                    label: 'Email Notifications',
                    description: 'Receive updates about your courses via email',
                    type: 'toggle',
                    value: emailNotifications,
                    onClick: () => setEmailNotifications(!emailNotifications)
                },
                {
                    label: 'Push Notifications',
                    description: 'Get notified about new lessons and achievements',
                    type: 'toggle',
                    value: pushNotifications,
                    onClick: () => setPushNotifications(!pushNotifications)
                },
                {
                    label: 'Weekly Digest',
                    description: 'Receive a weekly summary of your progress',
                    type: 'toggle',
                    value: weeklyDigest,
                    onClick: () => setWeeklyDigest(!weeklyDigest)
                }
            ]
        },
        {
            title: 'Accessibility',
            icon: Eye,
            items: [
                {
                    label: 'Sound Effects',
                    description: 'Play sounds for quiz answers and achievements',
                    type: 'toggle',
                    value: soundEffects,
                    onClick: () => setSoundEffects(!soundEffects)
                },
                {
                    label: 'Reduce Animations',
                    description: 'Minimize motion for accessibility',
                    type: 'toggle',
                    value: !animationsEnabled,
                    onClick: () => setAnimationsEnabled(!animationsEnabled)
                }
            ]
        },
        {
            title: 'Account',
            icon: Shield,
            items: [
                {
                    label: 'Change Password',
                    type: 'link',
                    onClick: () => { }
                },
                {
                    label: 'Manage Subscription',
                    type: 'link',
                    onClick: () => router.push('/pricing')
                },
                {
                    label: 'Export Data',
                    description: 'Download all your learning data',
                    type: 'button',
                    onClick: () => alert('Export feature coming soon!')
                },
                {
                    label: 'Delete Account',
                    description: 'Permanently delete your account and all data',
                    type: 'button',
                    danger: true,
                    onClick: () => {
                        if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
                            alert('Account deletion coming soon');
                        }
                    }
                }
            ]
        }
    ];

    return (
        <div className={cn(
            "min-h-screen transition-colors",
            theme === 'light' ? "bg-slate-100 text-slate-900" : "bg-[#020617] text-slate-50"
        )}>
            <Header />

            <main className="pt-28 pb-16 px-6 max-w-3xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <button
                        onClick={() => router.push('/dashboard')}
                        className={cn(
                            "flex items-center gap-2 text-sm mb-6 transition-colors",
                            theme === 'light' ? "text-slate-500 hover:text-slate-900" : "text-slate-400 hover:text-white"
                        )}
                    >
                        <ArrowLeft size={16} />
                        Back to Dashboard
                    </button>

                    <h1 className="text-4xl font-black tracking-tight mb-2">Settings</h1>
                    <p className={cn(
                        "text-lg",
                        theme === 'light' ? "text-slate-500" : "text-slate-400"
                    )}>
                        Manage your account and preferences
                    </p>
                </motion.div>

                {/* Profile Card */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={cn(
                        "rounded-[2rem] p-6 mb-8 border",
                        theme === 'light'
                            ? "bg-white border-slate-200"
                            : "glass-dark border-white/5"
                    )}
                >
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center text-2xl font-bold text-white">
                            {userEmail.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold">{userEmail}</h2>
                            <p className={cn(
                                "text-sm",
                                theme === 'light' ? "text-slate-500" : "text-slate-400"
                            )}>
                                Pro Member
                            </p>
                        </div>
                        <button
                            onClick={() => { }}
                            className={cn(
                                "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                                theme === 'light'
                                    ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                    : "bg-white/5 hover:bg-white/10 text-white"
                            )}
                        >
                            Edit Profile
                        </button>
                    </div>
                </motion.section>

                {/* Theme Selector */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className={cn(
                        "rounded-[2rem] p-6 mb-6 border",
                        theme === 'light'
                            ? "bg-white border-slate-200"
                            : "glass-dark border-white/5"
                    )}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <Palette className="text-indigo-400" size={24} />
                        <h2 className="text-xl font-bold">Appearance</h2>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { value: 'light' as Theme, label: 'Light', icon: Sun },
                            { value: 'dark' as Theme, label: 'Dark', icon: Moon },
                            { value: 'system' as Theme, label: 'System', icon: Globe }
                        ].map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleThemeChange(option.value)}
                                className={cn(
                                    "flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all",
                                    theme === option.value
                                        ? "border-indigo-500 bg-indigo-500/10"
                                        : theme === 'light'
                                            ? "border-slate-200 hover:border-slate-300 bg-slate-50"
                                            : "border-white/5 hover:border-white/10 bg-white/5"
                                )}
                            >
                                <option.icon
                                    size={28}
                                    className={theme === option.value ? "text-indigo-400" : ""}
                                />
                                <span className="font-medium">{option.label}</span>
                                {theme === option.value && (
                                    <span className="text-xs text-indigo-400 font-bold">Active</span>
                                )}
                            </button>
                        ))}
                    </div>
                </motion.section>

                {/* Settings Sections */}
                {settings.slice(1).map((section, sectionIndex) => (
                    <motion.section
                        key={section.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + sectionIndex * 0.05 }}
                        className={cn(
                            "rounded-[2rem] p-6 mb-6 border",
                            theme === 'light'
                                ? "bg-white border-slate-200"
                                : "glass-dark border-white/5"
                        )}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <section.icon className="text-indigo-400" size={24} />
                            <h2 className="text-xl font-bold">{section.title}</h2>
                        </div>

                        <div className="space-y-4">
                            {section.items.map((item, itemIndex) => (
                                <div
                                    key={itemIndex}
                                    className={cn(
                                        "flex items-center justify-between p-4 rounded-xl transition-colors",
                                        theme === 'light'
                                            ? "bg-slate-50 hover:bg-slate-100"
                                            : "bg-white/5 hover:bg-white/10"
                                    )}
                                >
                                    <div className="flex-1">
                                        <p className={cn(
                                            "font-medium",
                                            item.danger ? "text-rose-400" : ""
                                        )}>
                                            {item.label}
                                        </p>
                                        {item.description && (
                                            <p className={cn(
                                                "text-sm mt-0.5",
                                                theme === 'light' ? "text-slate-500" : "text-slate-400"
                                            )}>
                                                {item.description}
                                            </p>
                                        )}
                                    </div>

                                    {item.type === 'toggle' && (
                                        <button
                                            onClick={item.onClick}
                                            className={cn(
                                                "w-12 h-7 rounded-full transition-colors relative",
                                                item.value
                                                    ? "bg-indigo-500"
                                                    : theme === 'light' ? "bg-slate-300" : "bg-slate-700"
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    "w-5 h-5 rounded-full bg-white absolute top-1 transition-transform",
                                                    item.value ? "translate-x-6" : "translate-x-1"
                                                )}
                                            />
                                        </button>
                                    )}

                                    {item.type === 'link' && (
                                        <button
                                            onClick={item.onClick}
                                            className={cn(
                                                "p-2 rounded-lg transition-colors",
                                                theme === 'light' ? "hover:bg-slate-200" : "hover:bg-white/10"
                                            )}
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    )}

                                    {item.type === 'button' && (
                                        <button
                                            onClick={item.onClick}
                                            className={cn(
                                                "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                                                item.danger
                                                    ? "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                                                    : theme === 'light'
                                                        ? "bg-slate-200 hover:bg-slate-300 text-slate-700"
                                                        : "bg-white/10 hover:bg-white/20 text-white"
                                            )}
                                        >
                                            {item.danger && <Trash2 size={14} className="inline mr-2" />}
                                            {item.danger ? 'Delete' : 'Action'}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.section>
                ))}

                {/* Logout Button */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <button
                        onClick={handleLogout}
                        className={cn(
                            "w-full flex items-center justify-center gap-3 p-4 rounded-2xl font-bold transition-colors",
                            theme === 'light'
                                ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                : "bg-white/5 hover:bg-white/10 text-white"
                        )}
                    >
                        <LogOut size={20} />
                        Log Out
                    </button>
                </motion.section>
            </main>
        </div>
    );
}
