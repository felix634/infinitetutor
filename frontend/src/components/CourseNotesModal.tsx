'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api, getSupabaseHeaders } from '@/lib/api';
import { supabase } from '@/lib/supabase';

interface Note {
    lesson_id: string;
    content: string;
    updated_at: string;
}

interface CourseNotesModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: string;
    courseTitle: string;
}

export default function CourseNotesModal({ isOpen, onClose, courseId, courseTitle }: CourseNotesModalProps) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (isOpen && courseId) {
            fetchNotes();
        } else {
            setNotes([]);
            setExpandedLessons(new Set());
        }
    }, [isOpen, courseId]);

    const fetchNotes = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const response = await fetch(`${api.notes}?course_id=${encodeURIComponent(courseId)}`, {
                headers: getSupabaseHeaders(session.access_token),
            });

            if (response.ok) {
                const data = await response.json();
                setNotes(data.notes || []);
                // Expand all lessons by default
                setExpandedLessons(new Set((data.notes || []).map((n: Note) => n.lesson_id)));
            }
        } catch (error) {
            console.error('Failed to fetch notes:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleLesson = (lessonId: string) => {
        setExpandedLessons(prev => {
            const newSet = new Set(prev);
            if (newSet.has(lessonId)) {
                newSet.delete(lessonId);
            } else {
                newSet.add(lessonId);
            }
            return newSet;
        });
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-2xl max-h-[80vh] bg-[#0f1419] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#2AB7CA]/20 flex items-center justify-center">
                                <FileText className="text-[#2AB7CA]" size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">Course Notes</h2>
                                <p className="text-sm text-slate-400 truncate max-w-[300px]">{courseTitle}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-white/5 transition-colors"
                        >
                            <X size={20} className="text-slate-400" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="animate-spin text-[#2AB7CA] mb-4" size={32} />
                                <p className="text-slate-400">Loading notes...</p>
                            </div>
                        ) : notes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                                    <FileText className="text-slate-500" size={28} />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">No notes yet</h3>
                                <p className="text-slate-400 max-w-sm">
                                    Start taking notes during your lessons to see them here!
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {notes.map((note) => (
                                    <div
                                        key={note.lesson_id}
                                        className="bg-white/5 rounded-xl overflow-hidden border border-white/5"
                                    >
                                        <button
                                            onClick={() => toggleLesson(note.lesson_id)}
                                            className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors text-left"
                                        >
                                            {expandedLessons.has(note.lesson_id) ? (
                                                <ChevronDown size={18} className="text-[#2AB7CA]" />
                                            ) : (
                                                <ChevronRight size={18} className="text-slate-400" />
                                            )}
                                            <span className="font-medium text-white flex-1 truncate">
                                                {note.lesson_id}
                                            </span>
                                            <span className="text-xs text-slate-500">
                                                {new Date(note.updated_at).toLocaleDateString()}
                                            </span>
                                        </button>

                                        <AnimatePresence>
                                            {expandedLessons.has(note.lesson_id) && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-4 pb-4 pl-11">
                                                        <div className="bg-slate-900/50 rounded-lg p-4 text-sm text-slate-300 whitespace-pre-wrap">
                                                            {note.content || <span className="text-slate-500 italic">Empty note</span>}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
