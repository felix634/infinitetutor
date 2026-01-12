'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

export default function Header() {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        const email = localStorage.getItem('user_email');
        setIsLoggedIn(!!token);
        setUserEmail(email || '');
    }, [pathname]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
        setIsLoggedIn(false);
        router.push('/login');
    };

    const navItems = [
        { label: 'How it works', href: '/how-it-works' },
        { label: 'Pricing', href: '/pricing' },
    ];

    return (
        <header className="fixed top-0 w-full z-50 glass-dark border-b border-white/5 px-6 py-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                {/* Logo */}
                <button
                    onClick={() => router.push('/')}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                    <Image
                        src="/logo.png"
                        alt="InfiniteTutor"
                        width={40}
                        height={40}
                        className="w-10 h-10 object-contain"
                    />
                    <span className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#2AB7CA] to-[#FED766]">InfiniteTutor</span>
                </button>

                {/* Navigation */}
                <div className="flex items-center gap-6">
                    {/* Nav Links */}
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                        {navItems.map((item) => (
                            <button
                                key={item.label}
                                onClick={() => router.push(item.href)}
                                className={cn(
                                    "text-slate-400 hover:text-white transition-colors",
                                    pathname === item.href && "text-[#2AB7CA]"
                                )}
                            >
                                {item.label}
                            </button>
                        ))}

                        {isLoggedIn && (
                            <button
                                onClick={() => router.push('/dashboard')}
                                className={cn(
                                    "text-slate-400 hover:text-[#2AB7CA] transition-colors",
                                    pathname === '/dashboard' && "text-[#2AB7CA]"
                                )}
                            >
                                Dashboard
                            </button>
                        )}
                    </nav>

                    {/* Profile / Login */}
                    {isLoggedIn ? (
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className={cn(
                                    "w-10 h-10 rounded-full bg-gradient-to-br from-[#2AB7CA] to-[#FED766] flex items-center justify-center text-[#0B0C10] font-bold text-sm shadow-lg shadow-[#2AB7CA]/20 hover:scale-105 transition-transform",
                                    showProfileMenu && "ring-2 ring-white/20"
                                )}
                            >
                                {userEmail.charAt(0).toUpperCase()}
                            </button>

                            {/* Dropdown Menu */}
                            {showProfileMenu && (
                                <div className="absolute right-0 mt-2 w-64 glass-dark border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                                    <div className="p-4 border-b border-white/5">
                                        <p className="text-sm font-medium text-white truncate">{userEmail}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">Learner</p>
                                    </div>

                                    <div className="p-2">
                                        <button
                                            onClick={() => {
                                                setShowProfileMenu(false);
                                                router.push('/dashboard');
                                            }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-all"
                                        >
                                            <User size={16} />
                                            My Dashboard
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowProfileMenu(false);
                                                router.push('/settings');
                                            }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-all"
                                        >
                                            <Settings size={16} />
                                            Settings
                                        </button>
                                    </div>

                                    <div className="p-2 border-t border-white/5">
                                        <button
                                            onClick={() => {
                                                setShowProfileMenu(false);
                                                handleLogout();
                                            }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-rose-400 hover:bg-rose-500/10 transition-all"
                                        >
                                            <LogOut size={16} />
                                            Log out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={() => router.push('/login')}
                            className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-full transition-all border border-white/10 text-sm font-medium"
                        >
                            Log In
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
