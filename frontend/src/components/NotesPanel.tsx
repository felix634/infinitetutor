'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Pencil, Save, Eye, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';

interface NotesPanelProps {
    courseId: string;
    lessonId: string;
}

export default function NotesPanel({ courseId, lessonId }: NotesPanelProps) {
    const [notes, setNotes] = useState('');
    const [isPreview, setIsPreview] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load notes on mount
    useEffect(() => {
        loadNotes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId, lessonId]);

    const loadNotes = async () => {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
            try {
                const response = await fetch(api.notes(courseId, lessonId), {
                    headers: { 'Authorization': `Bearer ${session.access_token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setNotes(data.content || '');
                }
            } catch (error) {
                console.error('Failed to load notes:', error);
            }
        }
        setIsLoading(false);
    };

    // Debounced save function
    const saveNotes = useCallback(async (content: string) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;

        setIsSaving(true);
        try {
            await fetch(api.notes(courseId, lessonId), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ content })
            });
            setLastSaved(new Date());
        } catch (error) {
            console.error('Failed to save notes:', error);
        }
        setIsSaving(false);
    }, [courseId, lessonId]);

    // Auto-save with debounce
    useEffect(() => {
        if (isLoading || notes === '') return;

        const timer = setTimeout(() => {
            saveNotes(notes);
        }, 1000); // Save 1 second after typing stops

        return () => clearTimeout(timer);
    }, [notes, saveNotes, isLoading]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-48 text-slate-400">
                <Loader2 className="animate-spin mr-2" size={20} />
                Loading notes...
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Pencil className="text-[#2AB7CA]" size={20} />
                    <h3 className="font-bold text-lg">Your Notes</h3>
                </div>
                <div className="flex items-center gap-3">
                    {/* Save status */}
                    <span className="text-xs text-slate-500">
                        {isSaving ? (
                            <span className="flex items-center gap-1">
                                <Loader2 className="animate-spin" size={12} />
                                Saving...
                            </span>
                        ) : lastSaved ? (
                            <span className="flex items-center gap-1 text-green-500">
                                <Save size={12} />
                                Saved
                            </span>
                        ) : null}
                    </span>
                    {/* Preview toggle */}
                    <button
                        onClick={() => setIsPreview(!isPreview)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isPreview
                                ? 'bg-[#2AB7CA] text-white'
                                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        <Eye size={14} />
                        {isPreview ? 'Edit' : 'Preview'}
                    </button>
                </div>
            </div>

            {/* Notes content */}
            {isPreview ? (
                <div className="prose prose-invert prose-sm max-w-none p-4 bg-white/5 rounded-xl min-h-[200px] border border-white/10">
                    {notes ? (
                        <ReactMarkdown>{notes}</ReactMarkdown>
                    ) : (
                        <p className="text-slate-500 italic">No notes yet...</p>
                    )}
                </div>
            ) : (
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Take notes on this lesson... (Markdown supported)"
                    className="w-full h-48 p-4 bg-white/5 border border-white/10 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#2AB7CA]/50 focus:ring-1 focus:ring-[#2AB7CA]/50 resize-none font-mono text-sm"
                />
            )}

            {/* Markdown hint */}
            <p className="text-xs text-slate-500">
                💡 Tip: Use **bold**, *italic*, `code`, and - lists with Markdown
            </p>
        </div>
    );
}
