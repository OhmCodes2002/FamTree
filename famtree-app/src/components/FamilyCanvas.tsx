import { useCallback, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { PersonNode, type PersonNodeData } from './PersonNode';
import { useGraphStore } from '../store/graphStore';
import { getRelationshipLabel } from '../data/relationshipTypes';

const nodeTypes = { person: PersonNode };

interface FamilyCanvasProps {
  selectedPersonId: string | null;
  linkFromId: string | null;
  linkMode: boolean;
  onSelectPerson: (id: string | null) => void;
  onLinkPick: (id: string) => void;
  onPositionsChange: (positions: Record<string, { x: number; y: number }>) => void;
}

export function FamilyCanvas({
  selectedPersonId,
  linkFromId,
  linkMode,
  onSelectPerson,
  onLinkPick,
  onPositionsChange,
}: FamilyCanvasProps) {
  const people = useGraphStore((s) => s.people);
  const relationships = useGraphStore((s) => s.relationships);

  const initialNodes = useMemo((): Node[] => {
    return people.map((p, i) => ({
      id: p.id,
      type: 'person',
      position: {
        x: p.pos_x ?? 80 + (i % 4) * 200,
        y: p.pos_y ?? 80 + Math.floor(i / 4) * 120,
      },
      data: { person: p } satisfies PersonNodeData,
    }));
  }, [people]);

  const initialEdges = useMemo((): Edge[] => {
    return relationships.map((r) => ({
      id: r.id,
      source: r.from_id,
      target: r.to_id,
      label: getRelationshipLabel(r.relationship),
      labelStyle: { fill: '#1a3c34', fontSize: 11, fontWeight: 600 },
      labelBgStyle: { fill: '#f5f0e6', fillOpacity: 0.9 },
      labelBgPadding: [4, 6] as [number, number],
      labelBgBorderRadius: 4,
      style: { stroke: '#c45c3e', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#c45c3e' },
    }));
  }, [relationships]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(
      people.map((p, i) => ({
        id: p.id,
        type: 'person',
        position: {
          x: p.pos_x ?? 80 + (i % 4) * 200,
          y: p.pos_y ?? 80 + Math.floor(i / 4) * 120,
        },
        data: {
          person: p,
          selected: p.id === selectedPersonId,
          linkCandidate: linkMode && (p.id === linkFromId || (!linkFromId && p.id !== linkFromId)),
        } satisfies PersonNodeData,
      })),
    );
  }, [people, selectedPersonId, linkFromId, linkMode, setNodes]);

  useEffect(() => {
    setEdges(
      relationships.map((r) => ({
        id: r.id,
        source: r.from_id,
        target: r.to_id,
        label: getRelationshipLabel(r.relationship),
        labelStyle: { fill: '#1a3c34', fontSize: 11, fontWeight: 600 },
        labelBgStyle: { fill: '#f5f0e6', fillOpacity: 0.9 },
        labelBgPadding: [4, 6] as [number, number],
        labelBgBorderRadius: 4,
        style: { stroke: '#c45c3e', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#c45c3e' },
      })),
    );
  }, [relationships, setEdges]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (linkMode) {
        onLinkPick(node.id);
        return;
      }
      onSelectPerson(node.id);
    },
    [linkMode, onLinkPick, onSelectPerson],
  );

  const onPaneClick = useCallback(() => {
    if (!linkMode) onSelectPerson(null);
  }, [linkMode, onSelectPerson]);

  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, __: Node, nds: Node[]) => {
      const positions: Record<string, { x: number; y: number }> = {};
      for (const n of nds) {
        positions[n.id] = n.position;
      }
      onPositionsChange(positions);
    },
    [onPositionsChange],
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={onNodeClick}
      onPaneClick={onPaneClick}
      onNodeDragStop={onNodeDragStop}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      minZoom={0.2}
      maxZoom={2}
      proOptions={{ hideAttribution: true }}
    >
      <Background color="#1a3c34" gap={24} size={1} style={{ opacity: 0.08 }} />
      <Controls showInteractive={false} />
      <MiniMap
        nodeColor={(n) => {
          const d = n.data as PersonNodeData;
          return d.person.life_status === 'dead' ? '#6b5f56' : '#c45c3e';
        }}
        maskColor="rgba(26, 60, 52, 0.12)"
        style={{ border: '2px solid #1a3c34', borderRadius: 8 }}
      />
    </ReactFlow>
  );
}
