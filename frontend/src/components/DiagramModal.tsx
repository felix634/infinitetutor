'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Download, Info } from 'lucide-react';
import MermaidRenderer from './MermaidRenderer';
import { api } from '@/lib/api';

interface DiagramResponse {
    lesson_title: string;
    mermaid_code: string;
    explanation: string;
}

interface DiagramModalProps {
    isOpen: boolean;
    onClose: () => void;
    lessonTitle: string;
    topic: string;
    level: string;
}

export default function DiagramModal({ isOpen, onClose, lessonTitle, topic, level }: DiagramModalProps) {
    const [data, setData] = useState<DiagramResponse | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchDiagram();
        } else {
            setData(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const fetchDiagram = async () => {
        setLoading(true);
        try {
            const response = await fetch(api.generateDiagram, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lesson_title: lessonTitle, topic, level }),
            });
            const result = await response.json();
            setData(result);
        } catch (error) {
            console.error('Error fetching diagram:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative w-full max-w-5xl glass-dark border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400">
                            <Zap size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{lessonTitle}</h2>
                            <p className="text-sm text-slate-400">Visual Concept Map</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors text-slate-400"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 max-h-[70vh] overflow-y-auto">
                    {loading ? (
                        <div className="py-24 flex flex-col items-center justify-center gap-6">
                            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-slate-400 font-medium">Generating visual mental model...</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <AnimatePresence mode="wait">
                                {data && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-8"
                                    >
                                        <MermaidRenderer chart={data.mermaid_code} />

                                        <div className="flex gap-4 p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                                            <Info className="text-indigo-400 shrink-0" size={20} />
                                            <p className="text-slate-300 leading-relaxed text-sm">
                                                {data.explanation}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-white/5 flex gap-4 bg-black/40">
                    <button className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                        <Download size={18} />
                        Download PDF
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
                    >
                        Got it, thanks!
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
