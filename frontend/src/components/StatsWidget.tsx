'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Target, Clock, Trophy } from 'lucide-react';
import { api, getSupabaseHeaders } from '@/lib/api';
import { supabase } from '@/lib/supabase';

interface Stats {
    streak: number;
    today_minutes: number;
    today_lessons: number;
    daily_goal_minutes: number;
    goal_progress_percent: number;
}

export default function StatsWidget() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
            try {
                const response = await fetch(api.stats, {
                    headers: getSupabaseHeaders(session.access_token)
                });
                if (!response.ok) {
                    console.warn('Stats fetch failed', response.status);
                } else {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Failed to load stats:', error);
            }
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="glass-dark border border-white/5 rounded-2xl p-6 animate-pulse">
                <div className="h-20 bg-white/5 rounded-xl"></div>
            </div>
        );
    }

    // Default stats if none loaded
    const displayStats = stats || {
        streak: 0,
        today_minutes: 0,
        today_lessons: 0,
        daily_goal_minutes: 30,
        goal_progress_percent: 0
    };

    return (
        <div className="glass-dark border border-white/5 rounded-2xl p-6 shadow-2xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Streak */}
                <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-4 text-center">
                    <div className="flex justify-center mb-2">
                        <Flame className="text-orange-400" size={28} />
                    </div>
                    <div className="text-3xl font-black text-orange-400">
                        {displayStats.streak}
                    </div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">
                        Day Streak
                    </div>
                </div>

                {/* Today's Progress */}
                <div className="bg-gradient-to-br from-[#2AB7CA]/20 to-cyan-500/20 border border-[#2AB7CA]/30 rounded-xl p-4 text-center">
                    <div className="flex justify-center mb-2">
                        <Target className="text-[#2AB7CA]" size={28} />
                    </div>
                    <div className="text-3xl font-black text-[#2AB7CA]">
                        {displayStats.goal_progress_percent}%
                    </div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">
                        Daily Goal
                    </div>
                </div>

                {/* Time Today */}
                <div className="bg-gradient-to-br from-[#FED766]/20 to-yellow-500/20 border border-[#FED766]/30 rounded-xl p-4 text-center">
                    <div className="flex justify-center mb-2">
                        <Clock className="text-[#FED766]" size={28} />
                    </div>
                    <div className="text-3xl font-black text-[#FED766]">
                        {displayStats.today_minutes}m
                    </div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">
                        Today
                    </div>
                </div>

                {/* Lessons Today */}
                <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30 rounded-xl p-4 text-center">
                    <div className="flex justify-center mb-2">
                        <Trophy className="text-emerald-400" size={28} />
                    </div>
                    <div className="text-3xl font-black text-emerald-400">
                        {displayStats.today_lessons}
                    </div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">
                        Lessons
                    </div>
                </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Daily Goal Progress</span>
                    <span>{displayStats.today_minutes}/{displayStats.daily_goal_minutes} min</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-[#2AB7CA] to-[#FED766] transition-all duration-500"
                        style={{ width: `${displayStats.goal_progress_percent}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
