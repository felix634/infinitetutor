'use client';

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    securityLevel: 'loose',
    themeVariables: {
        // Background colors - using Void Black
        background: '#0B0C10',
        primaryColor: '#1a1d24',
        secondaryColor: '#252a33',
        tertiaryColor: '#2f3542',

        // Text colors - ensure white/light text everywhere
        primaryTextColor: '#f1f5f9',
        secondaryTextColor: '#e2e8f0',
        tertiaryTextColor: '#cbd5e1',
        lineColor: '#2AB7CA',

        // Node colors - Cyber Blue borders
        nodeBorder: '#2AB7CA',
        clusterBkg: '#1a1d24',
        clusterBorder: '#2AB7CA',

        // Flowchart specific
        nodeTextColor: '#f1f5f9',
        mainBkg: '#1a1d24',

        // Edge/Arrow colors
        edgeLabelBackground: '#1a1d24',

        // Special node colors override
        fillType0: '#1a1d24',
        fillType1: '#1a2633',
        fillType2: '#1a2a30',
        fillType3: '#1a3328',
        fillType4: '#251a33',
        fillType5: '#331a28',
        fillType6: '#1a2633',
        fillType7: '#1a3030',
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
                                fill: #1a1d24 !important; 
                                stroke: #2AB7CA !important; 
                            }
                            .node .label, .nodeLabel, .node text, text.nodeLabel { 
                                fill: #f1f5f9 !important; 
                                color: #f1f5f9 !important;
                            }
                            .edgeLabel, .edgeLabel text, .edgeLabel span {
                                fill: #e2e8f0 !important;
                                color: #e2e8f0 !important;
                                background-color: #1a1d24 !important;
                            }
                            .label text, text {
                                fill: #f1f5f9 !important;
                            }
                            .cluster rect {
                                fill: #1a1d24 !important;
                                stroke: #2AB7CA !important;
                            }
                            .flowchart-link {
                                stroke: #2AB7CA !important;
                            }
                            marker path {
                                fill: #2AB7CA !important;
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
