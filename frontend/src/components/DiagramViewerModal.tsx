'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X, Zap } from 'lucide-react';
import MermaidRenderer from './MermaidRenderer';

interface DiagramViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    lessonTitle: string;
    mermaidCode: string;
}

export default function DiagramViewerModal({
    isOpen,
    onClose,
    lessonTitle,
    mermaidCode,
}: DiagramViewerModalProps) {
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
                className="relative w-full max-w-5xl max-h-[90vh] glass-dark border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
            >
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-[#FED766]/20 rounded-xl text-[#FED766]">
                            <Zap size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{lessonTitle}</h2>
                            <p className="text-sm text-slate-400">Visual Mental Model</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors text-slate-400"
                        aria-label="Close"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto flex-1 min-h-0">
                    <div className="bg-slate-900/50 rounded-2xl border border-white/5 p-6">
                        <MermaidRenderer chart={mermaidCode} />
                    </div>
                </div>

                <div className="p-6 border-t border-white/5 shrink-0 bg-black/40">
                    <button
                        onClick={onClose}
                        className="w-full bg-[#2AB7CA] hover:bg-indigo-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-[#2AB7CA]/20"
                    >
                        Got it, thanks!
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
