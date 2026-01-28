'use client';

import React, { useCallback, useEffect, useMemo } from 'react';
import {
    ReactFlow,
    Node,
    Edge,
    useNodesState,
    useEdgesState,
    Background,
    Controls,
    MiniMap,
    ConnectionLineType,
    MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import '@xyflow/react/dist/base.css';
import dagre from 'dagre';
import { motion } from 'framer-motion';

// Types for diagram data
export interface DiagramNode {
    id: string;
    label: string;
    type?: 'root' | 'branch' | 'leaf';
}

export interface DiagramEdge {
    from: string;
    to: string;
}

export interface DiagramData {
    nodes: DiagramNode[];
    edges: DiagramEdge[];
}

interface ReactFlowDiagramProps {
    data?: DiagramData;
    mermaidCode?: string; // Fallback for legacy data
    className?: string;
    showMiniMap?: boolean;
    showControls?: boolean;
}

// Brand colors
const COLORS = {
    cyberBlue: '#2AB7CA',
    neuralGold: '#FED766',
    voidBlack: '#0B0C10',
    teal: '#45B7AA',
    pink: '#E8B4BC',
};

// Custom node styles based on type
const getNodeStyle = (type: string = 'leaf', index: number) => {
    const baseStyle = {
        padding: '12px 20px',
        borderRadius: '12px',
        fontSize: '13px',
        fontWeight: 600,
        border: '2px solid',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        minWidth: '80px',
        textAlign: 'center' as const,
    };

    if (type === 'root') {
        return {
            ...baseStyle,
            background: `linear-gradient(135deg, ${COLORS.cyberBlue}, ${COLORS.teal})`,
            borderColor: COLORS.cyberBlue,
            color: COLORS.voidBlack,
            fontSize: '15px',
            fontWeight: 700,
            padding: '16px 24px',
            boxShadow: `0 0 20px ${COLORS.cyberBlue}40, 0 4px 12px rgba(0,0,0,0.4)`,
        };
    }

    if (type === 'branch') {
        return {
            ...baseStyle,
            background: COLORS.neuralGold,
            borderColor: COLORS.neuralGold,
            color: COLORS.voidBlack,
            boxShadow: `0 0 12px ${COLORS.neuralGold}30, 0 4px 12px rgba(0,0,0,0.3)`,
        };
    }

    // Alternate colors for leaf nodes
    const leafColors = [COLORS.cyberBlue, COLORS.teal, COLORS.pink, COLORS.cyberBlue];
    const color = leafColors[index % leafColors.length];

    return {
        ...baseStyle,
        background: color,
        borderColor: color,
        color: COLORS.voidBlack,
    };
};

// Parse mermaid mindmap to structured data (fallback for legacy)
const parseMermaidToData = (mermaidCode: string): DiagramData => {
    const nodes: DiagramNode[] = [];
    const edges: DiagramEdge[] = [];

    const lines = mermaidCode.split('\n').filter(line => line.trim() && !line.trim().startsWith('mindmap'));

    let nodeId = 0;
    const parentStack: { id: string; indent: number }[] = [];

    for (const line of lines) {
        const indent = line.search(/\S/);
        const content = line.trim();

        if (!content) continue;

        // Extract label from various formats
        let label = content;
        // root((text)) format
        const rootMatch = content.match(/root\(\((.+?)\)\)/);
        if (rootMatch) {
            label = rootMatch[1];
        }
        // Remove markdown-like formatting
        label = label.replace(/^root\(\(|\)\)$/g, '')
            .replace(/^\(+|\)+$/g, '')
            .replace(/^\[+|\]+$/g, '')
            .replace(/^`+|`+$/g, '')
            .replace(/^["']+|["']+$/g, '')
            .trim();

        if (!label || label === 'root') continue;

        const id = `node-${nodeId++}`;
        const type = parentStack.length === 0 ? 'root' : (parentStack.length === 1 ? 'branch' : 'leaf');

        nodes.push({ id, label, type });

        // Find parent based on indentation
        while (parentStack.length > 0 && parentStack[parentStack.length - 1].indent >= indent) {
            parentStack.pop();
        }

        if (parentStack.length > 0) {
            edges.push({ from: parentStack[parentStack.length - 1].id, to: id });
        }

        parentStack.push({ id, indent });
    }

    return { nodes, edges };
};

// Auto-layout using dagre
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: direction, nodesep: 50, ranksep: 100 });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: 150, height: 50 });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        return {
            ...node,
            position: {
                x: nodeWithPosition.x - 75,
                y: nodeWithPosition.y - 25,
            },
        };
    });

    return { nodes: layoutedNodes, edges };
};

export default function ReactFlowDiagram({
    data,
    mermaidCode,
    className = '',
    showMiniMap = true,
    showControls = true,
}: ReactFlowDiagramProps) {
    // Parse data from props or mermaid fallback
    const diagramData = useMemo(() => {
        if (data && data.nodes && data.nodes.length > 0) {
            return data;
        }
        if (mermaidCode) {
            return parseMermaidToData(mermaidCode);
        }
        return { nodes: [], edges: [] };
    }, [data, mermaidCode]);

    // Convert to React Flow format
    const { initialNodes, initialEdges } = useMemo(() => {
        let leafIndex = 0;
        const rfNodes: Node[] = diagramData.nodes.map((node) => {
            const type = node.type || 'leaf';
            if (type === 'leaf') leafIndex++;

            return {
                id: node.id,
                type: 'default',
                data: { label: node.label },
                position: { x: 0, y: 0 },
                style: getNodeStyle(type, leafIndex),
            };
        });

        const rfEdges: Edge[] = diagramData.edges.map((edge, index) => ({
            id: `edge-${index}`,
            source: edge.from,
            target: edge.to,
            type: 'smoothstep',
            animated: true,
            style: { stroke: COLORS.cyberBlue, strokeWidth: 2 },
            markerEnd: {
                type: MarkerType.ArrowClosed,
                color: COLORS.cyberBlue,
            },
        }));

        // Apply auto-layout
        const layouted = getLayoutedElements(rfNodes, rfEdges);
        return { initialNodes: layouted.nodes, initialEdges: layouted.edges };
    }, [diagramData]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // Update nodes when data changes
    useEffect(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [initialNodes, initialEdges, setNodes, setEdges]);

    if (diagramData.nodes.length === 0) {
        return (
            <div className={`w-full h-64 flex items-center justify-center bg-slate-900/50 rounded-2xl border border-white/5 ${className}`}>
                <p className="text-slate-500 text-sm">No diagram data available</p>
            </div>
        );
    }

    // Determine if height should be inherited from parent
    const heightStyle = className.includes('h-full') ? { height: '100%' } : { height: '400px', minHeight: '400px' };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`w-full bg-slate-900/50 rounded-2xl border border-white/5 overflow-hidden ${className.replace('!h-full', '')}`}
            style={heightStyle}
        >
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                connectionLineType={ConnectionLineType.SmoothStep}
                fitView
                fitViewOptions={{ padding: 0.3 }}
                minZoom={0.3}
                maxZoom={2}
                attributionPosition="bottom-left"
                proOptions={{ hideAttribution: true }}
            >
                <Background color={COLORS.cyberBlue} gap={20} size={1} />
                {showControls && (
                    <Controls
                        style={{
                            background: COLORS.voidBlack,
                            border: `1px solid ${COLORS.cyberBlue}40`,
                            borderRadius: '8px',
                        }}
                    />
                )}
                {showMiniMap && (
                    <MiniMap
                        style={{
                            background: COLORS.voidBlack,
                            border: `1px solid ${COLORS.cyberBlue}40`,
                            borderRadius: '8px',
                        }}
                        nodeColor={(node) => {
                            const style = node.style as React.CSSProperties;
                            return (style?.background as string) || COLORS.cyberBlue;
                        }}
                        maskColor={`${COLORS.voidBlack}80`}
                    />
                )}
            </ReactFlow>
        </motion.div>
    );
}
