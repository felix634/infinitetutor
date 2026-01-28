'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Zap, Maximize, Minimize } from 'lucide-react';
import ReactFlowDiagram, { DiagramData } from './ReactFlowDiagram';

interface DiagramViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    lessonTitle: string;
    mermaidCode?: string;
    diagramData?: DiagramData;
}

export default function DiagramViewerModal({
    isOpen,
    onClose,
    lessonTitle,
    mermaidCode,
    diagramData,
}: DiagramViewerModalProps) {
    const [isFullscreen, setIsFullscreen] = useState(false);

    if (!isOpen) return null;

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

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
                className="relative w-full max-w-6xl max-h-[90vh] glass-dark border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
            >
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-[#FED766]/20 rounded-xl text-[#FED766]">
                            <Zap size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{lessonTitle}</h2>
                            <p className="text-sm text-slate-400">Interactive Concept Map</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleFullscreen}
                            className="p-2 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                            aria-label="Toggle fullscreen"
                        >
                            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-white/10 transition-colors text-slate-400"
                            aria-label="Close"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="p-6 flex-1 overflow-hidden" style={{ minHeight: '500px' }}>
                    <ReactFlowDiagram
                        data={diagramData}
                        mermaidCode={mermaidCode}
                        className="!h-full"
                        showMiniMap={true}
                        showControls={true}
                    />
                </div>

                <div className="p-4 border-t border-white/5 shrink-0 bg-black/40 flex items-center justify-between">
                    <p className="text-slate-500 text-sm">
                        💡 Drag to pan • Scroll to zoom • Drag nodes to rearrange
                    </p>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-[#2AB7CA] hover:bg-indigo-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-[#2AB7CA]/20"
                    >
                        Close
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
