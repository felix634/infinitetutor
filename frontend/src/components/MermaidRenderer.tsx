'use client';

import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
    startOnLoad: true,
    theme: 'dark',
    securityLevel: 'loose',
    themeVariables: {
        primaryColor: '#6366f1',
        primaryTextColor: '#fff',
        primaryBorderColor: '#6366f1',
        lineColor: '#10b981',
        secondaryColor: '#10b981',
        tertiaryColor: '#1e293b'
    }
});

interface MermaidRendererProps {
    chart: string;
}

export default function MermaidRenderer({ chart }: MermaidRendererProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current && chart) {
            ref.current.removeAttribute('data-processed');
            mermaid.contentLoaded();
        }
    }, [chart]);

    return (
        <div
            key={chart}
            ref={ref}
            className="mermaid w-full flex justify-center bg-slate-900/50 p-8 rounded-3xl border border-white/5 overflow-auto"
        >
            {chart}
        </div>
    );
}
