import React, { useState } from 'react';
import { 
  Zap, 
  Droplet, 
  Server, 
  Radio, 
  Train, 
  ShieldAlert, 
  Activity, 
  Cpu, 
  Maximize2, 
  RotateCw, 
  Info,
  Layers
} from 'lucide-react';
import { TopologyNode, TopologyEdge } from '../types';

interface TopologyMapProps {
  nodes: TopologyNode[];
  edges: TopologyEdge[];
  onSelectNode: (nodeId: string) => void;
  selectedNodeId?: string;
}

export const TopologyMap: React.FC<TopologyMapProps> = ({
  nodes,
  edges,
  onSelectNode,
  selectedNodeId
}) => {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Helper icon selector
  const getNodeIcon = (type: string, name: string) => {
    const lower = (type + ' ' + name).toLowerCase();
    if (lower.includes('power') || lower.includes('substation') || lower.includes('grid')) {
      return <Zap className="w-4 h-4 text-amber-400" />;
    }
    if (lower.includes('water') || lower.includes('treatment')) {
      return <Droplet className="w-4 h-4 text-cyan-400" />;
    }
    if (lower.includes('data center') || lower.includes('server')) {
      return <Server className="w-4 h-4 text-blue-400" />;
    }
    if (lower.includes('communication') || lower.includes('relay') || lower.includes('tower')) {
      return <Radio className="w-4 h-4 text-indigo-400" />;
    }
    if (lower.includes('transport') || lower.includes('signaling') || lower.includes('hub')) {
      return <Train className="w-4 h-4 text-emerald-400" />;
    }
    if (lower.includes('gateway') || lower.includes('scada')) {
      return <Cpu className="w-4 h-4 text-purple-400" />;
    }
    return <Activity className="w-4 h-4 text-blue-400" />;
  };

  const getStatusBorder = (status: string) => {
    switch (status) {
      case 'threat_detected':
        return 'border-[#FB7185] bg-[#FB7185]/10 threat-pulse';
      case 'degraded':
        return 'border-[#FBBF24] bg-[#FBBF24]/10';
      case 'isolated':
      case 'offline':
        return 'border-gray-500 bg-gray-500/10';
      case 'healthy':
      default:
        return 'border-[#34D399] bg-[#34D399]/10';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'threat_detected':
        return 'bg-[#FB7185] shadow-[0_0_8px_#FB7185]';
      case 'degraded':
        return 'bg-[#FBBF24] shadow-[0_0_8px_#FBBF24]';
      case 'isolated':
      case 'offline':
        return 'bg-gray-400';
      case 'healthy':
      default:
        return 'bg-[#34D399] shadow-[0_0_8px_#34D399]';
    }
  };

  const getNodeCoords = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
  };

  return (
    <div className="relative w-full h-[420px] bg-[#08172A]/80 border border-[#203651] rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
      {/* Topology Header & Controls */}
      <div className="absolute top-4 left-5 right-5 z-20 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
            <h3 className="text-sm font-semibold text-[#EAF2FF] tracking-wide">Infrastructure Topology Overview</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#10243D] border border-[#203651] text-[#91A6C4]">
              Connected Grid SCADA
            </span>
          </div>
          <p className="text-[11px] text-[#91A6C4] mt-0.5">
            Real-time interactive interconnects across 5 critical infrastructure sectors
          </p>
        </div>

        {/* View Controls */}
        <div className="pointer-events-auto flex items-center gap-2 bg-[#0B1B30]/90 border border-[#203651] p-1 rounded-lg backdrop-blur-md">
          <button 
            onClick={() => setZoomLevel(prev => Math.min(prev + 0.15, 1.4))}
            className="px-2 py-1 text-xs text-[#91A6C4] hover:text-[#EAF2FF] hover:bg-[#10243D] rounded transition-colors"
            title="Zoom In"
          >
            +
          </button>
          <button 
            onClick={() => setZoomLevel(prev => Math.max(prev - 0.15, 0.75))}
            className="px-2 py-1 text-xs text-[#91A6C4] hover:text-[#EAF2FF] hover:bg-[#10243D] rounded transition-colors"
            title="Zoom Out"
          >
            -
          </button>
          <button 
            onClick={() => setZoomLevel(1)}
            className="p-1 text-[#91A6C4] hover:text-[#EAF2FF] hover:bg-[#10243D] rounded transition-colors"
            title="Fit to View"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SVG Canvas for Connectors */}
      <div 
        className="w-full h-full relative transition-transform duration-300 ease-out"
        style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
      >
        <svg className="w-full h-full absolute inset-0 pointer-events-none">
          <defs>
            <linearGradient id="edge-normal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#203651" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#203651" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="edge-threat" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FB7185" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#FB7185" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#FB7185" stopOpacity="0.8" />
            </linearGradient>
            <filter id="glow-threat" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Render Connections */}
          {edges.map((edge) => {
            const src = getNodeCoords(edge.source);
            const tgt = getNodeCoords(edge.target);
            if (!src.x || !tgt.x) return null;

            const isThreatEdge = edge.status === 'active_threat';
            const isDegradedEdge = edge.status === 'degraded';
            const isHighlighted = hoveredNodeId === edge.source || hoveredNodeId === edge.target;

            // Compute midpoint for label
            const midX = (src.x + tgt.x) / 2;
            const midY = (src.y + tgt.y) / 2;

            return (
              <g key={edge.id} className="transition-all duration-300">
                <line
                  x1={src.x}
                  y1={src.y}
                  x2={tgt.x}
                  y2={tgt.y}
                  stroke={isThreatEdge ? '#FB7185' : (isDegradedEdge ? '#FBBF24' : (isHighlighted ? '#3B82F6' : '#203651'))}
                  strokeWidth={isThreatEdge || isHighlighted ? 2.5 : 1.5}
                  strokeDasharray={isThreatEdge ? '6,4' : undefined}
                  className={isThreatEdge ? 'animate-pulse' : ''}
                />
                {/* Protocol badge on edge */}
                {(isHighlighted || isThreatEdge) && (
                  <g transform={`translate(${midX}, ${midY})`}>
                    <rect 
                      x="-38" 
                      y="-9" 
                      width="76" 
                      height="18" 
                      rx="4" 
                      fill="#08172A" 
                      stroke={isThreatEdge ? '#FB7185' : '#203651'} 
                      strokeWidth="1" 
                    />
                    <text 
                      x="0" 
                      y="3.5" 
                      fill={isThreatEdge ? '#FB7185' : '#91A6C4'} 
                      fontSize="9" 
                      textAnchor="middle" 
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {edge.protocol.split(' ')[0]}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Render Interactive Asset Nodes */}
        {nodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          const isHovered = hoveredNodeId === node.id;

          return (
            <div
              key={node.id}
              onClick={() => onSelectNode(node.id)}
              onMouseEnter={() => setHoveredNodeId(node.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
              style={{
                left: `${node.x}px`,
                top: `${node.y}px`,
                transform: 'translate(-50%, -50%)',
              }}
              className={`absolute cursor-pointer transition-all duration-200 z-10 ${
                isSelected ? 'scale-110' : 'hover:scale-105'
              }`}
            >
              <div className={`p-3 rounded-xl border ${getStatusBorder(node.status)} shadow-lg backdrop-blur-md min-w-[130px] flex items-center gap-3 transition-colors ${
                isSelected ? 'ring-2 ring-[#3B82F6] ring-offset-2 ring-offset-[#06111F]' : ''
              }`}>
                {/* Node Icon Avatar */}
                <div className="w-8 h-8 rounded-lg bg-[#08172A] border border-[#203651] flex items-center justify-center flex-shrink-0 shadow-inner">
                  {getNodeIcon(node.type, node.name)}
                </div>

                {/* Node Text & Status */}
                <div className="overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${getStatusDot(node.status)} flex-shrink-0`} />
                    <span className="text-xs font-semibold text-[#EAF2FF] truncate max-w-[100px]">
                      {node.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#91A6C4] mt-0.5 font-mono">
                    <span>{node.id}</span>
                    <span className={`font-semibold ${
                      node.risk_score > 60 ? 'text-[#FB7185]' : (node.risk_score > 30 ? 'text-[#FBBF24]' : 'text-[#34D399]')
                    }`}>
                      {node.risk_score > 0 ? `${node.risk_score}` : '0'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Legend */}
      <div className="absolute bottom-3 left-5 right-5 z-20 flex items-center justify-between bg-[#0B1B30]/90 border border-[#203651] px-4 py-2 rounded-xl backdrop-blur-md text-[11px]">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#34D399] shadow-[0_0_6px_#34D399]" />
            <span className="text-[#EAF2FF] font-medium">Healthy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FBBF24] shadow-[0_0_6px_#FBBF24]" />
            <span className="text-[#EAF2FF] font-medium">Degraded</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FB7185] shadow-[0_0_6px_#FB7185] animate-pulse" />
            <span className="text-[#EAF2FF] font-medium">Threat Detected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
            <span className="text-[#91A6C4]">Isolated / Offline</span>
          </div>
        </div>

        <div className="text-[#91A6C4] flex items-center gap-1 text-[10px]">
          <Info className="w-3.5 h-3.5 text-[#3B82F6]" />
          <span>Click any infrastructure node to inspect telemetry & telemetry flow</span>
        </div>
      </div>
    </div>
  );
};
