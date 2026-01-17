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
        primaryColor: '#2AB7CA',
        secondaryColor: '#FED766',
        tertiaryColor: '#2AB7CA',

        // Text colors - dark text for colored backgrounds
        primaryTextColor: '#0B0C10',
        secondaryTextColor: '#0B0C10',
        tertiaryTextColor: '#0B0C10',
        lineColor: '#2AB7CA',

        // Node colors - Brand colors
        nodeBorder: '#2AB7CA',
        clusterBkg: '#0B0C10',
        clusterBorder: '#2AB7CA',

        // Flowchart specific
        nodeTextColor: '#0B0C10',
        mainBkg: '#2AB7CA',

        // Edge/Arrow colors
        edgeLabelBackground: '#0B0C10',

        // Special node colors - alternate between Cyber Blue and Neural Gold
        fillType0: '#2AB7CA',
        fillType1: '#FED766',
        fillType2: '#2AB7CA',
        fillType3: '#FED766',
        fillType4: '#2AB7CA',
        fillType5: '#FED766',
        fillType6: '#2AB7CA',
        fillType7: '#FED766',
    },
    flowchart: {
        htmlLabels: true,
        curve: 'basis',
        nodeSpacing: 80,
        rankSpacing: 80,
        padding: 25,
        useMaxWidth: true,
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

                    // Apply additional styling with brand colors
                    const styledSvg = svg.replace(
                        /<style>/,
                        `<style>
                            .node rect, .node circle, .node ellipse, .node polygon, .node path { 
                                fill: #2AB7CA !important; 
                                stroke: #0B0C10 !important;
                                stroke-width: 2px !important;
                            }
                            .node:nth-child(even) rect, .node:nth-child(even) circle, .node:nth-child(even) ellipse, .node:nth-child(even) polygon {
                                fill: #FED766 !important;
                            }
                            .node .label, .nodeLabel, .node text, text.nodeLabel { 
                                fill: #0B0C10 !important; 
                                color: #0B0C10 !important;
                                font-weight: 600 !important;
                                font-size: 12px !important;
                            }
                            .node .label foreignObject {
                                overflow: visible !important;
                            }
                            .node .label foreignObject div {
                                white-space: nowrap !important;
                                font-size: 12px !important;
                            }
                            .edgeLabel, .edgeLabel text, .edgeLabel span {
                                fill: #f1f5f9 !important;
                                color: #f1f5f9 !important;
                                background-color: #0B0C10 !important;
                                font-size: 11px !important;
                            }
                            .label text, text {
                                fill: #0B0C10 !important;
                            }
                            .cluster rect {
                                fill: #0B0C10 !important;
                                stroke: #2AB7CA !important;
                            }
                            .cluster .nodeLabel, .cluster text {
                                fill: #f1f5f9 !important;
                            }
                            .flowchart-link {
                                stroke: #2AB7CA !important;
                                stroke-width: 2px !important;
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
