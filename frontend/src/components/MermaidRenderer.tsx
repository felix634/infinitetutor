'use client';

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    securityLevel: 'loose',
    themeVariables: {
        // Background colors
        background: '#0f172a',
        primaryColor: '#1e293b',
        secondaryColor: '#334155',
        tertiaryColor: '#475569',

        // Text colors - ensure white/light text everywhere
        primaryTextColor: '#f1f5f9',
        secondaryTextColor: '#e2e8f0',
        tertiaryTextColor: '#cbd5e1',
        lineColor: '#6366f1',

        // Node colors
        nodeBorder: '#6366f1',
        clusterBkg: '#1e293b',
        clusterBorder: '#6366f1',

        // Flowchart specific
        nodeTextColor: '#f1f5f9',
        mainBkg: '#1e293b',

        // Edge/Arrow colors
        edgeLabelBackground: '#1e293b',

        // Special node colors override
        fillType0: '#1e293b',
        fillType1: '#1e3a5f',
        fillType2: '#1e3a4f',
        fillType3: '#1e4a3f',
        fillType4: '#2e2a4f',
        fillType5: '#3e2a3f',
        fillType6: '#1e3a5f',
        fillType7: '#1e4a4f',
    },
    flowchart: {
        htmlLabels: true,
        curve: 'basis',
        nodeSpacing: 50,
        rankSpacing: 50,
    },
});

interface MermaidRendererProps {
    chart: string;
}

export default function MermaidRenderer({ chart }: MermaidRendererProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [svg, setSvg] = useState<string>('');

    useEffect(() => {
        const renderChart = async () => {
            if (chart && ref.current) {
                try {
                    // Clean the chart code
                    let cleanChart = chart.trim();

                    // Generate unique ID
                    const id = `mermaid-${Date.now()}`;

                    // Render the chart
                    const { svg } = await mermaid.render(id, cleanChart);

                    // Apply additional styling to ensure white text
                    const styledSvg = svg.replace(
                        /<style>/,
                        `<style>
                            .node rect, .node circle, .node ellipse, .node polygon, .node path { 
                                fill: #1e293b !important; 
                                stroke: #6366f1 !important; 
                            }
                            .node .label, .nodeLabel, .node text, text.nodeLabel { 
                                fill: #f1f5f9 !important; 
                                color: #f1f5f9 !important;
                            }
                            .edgeLabel, .edgeLabel text, .edgeLabel span {
                                fill: #e2e8f0 !important;
                                color: #e2e8f0 !important;
                                background-color: #1e293b !important;
                            }
                            .label text, text {
                                fill: #f1f5f9 !important;
                            }
                            .cluster rect {
                                fill: #1e293b !important;
                                stroke: #6366f1 !important;
                            }
                            .flowchart-link {
                                stroke: #6366f1 !important;
                            }
                            marker path {
                                fill: #6366f1 !important;
                            }
                        `
                    );

                    setSvg(styledSvg);
                } catch (error) {
                    console.error('Mermaid render error:', error);
                    setSvg(`<div class="text-rose-400 p-4">Failed to render diagram</div>`);
                }
            }
        };

        renderChart();
    }, [chart]);

    return (
        <div
            ref={ref}
            className="mermaid-container w-full flex justify-center bg-slate-900/50 p-8 rounded-3xl border border-white/5 overflow-auto"
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
}
