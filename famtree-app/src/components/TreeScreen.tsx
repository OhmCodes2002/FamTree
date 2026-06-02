import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactFlowProvider } from '@xyflow/react';
import { FamilyCanvas } from './FamilyCanvas';
import { PersonSheet } from './PersonSheet';
import { RelationshipDialog } from './RelationshipDialog';
import { ExportDialog } from './ExportDialog';
import { useGraphStore } from '../store/graphStore';
import { layoutGraph } from '../utils/layout';
import type { Node, Edge } from '@xyflow/react';

type LinkStep = 'idle' | 'pickFrom' | 'pickTo' | 'confirm';

export function TreeScreen() {
  const navigate = useNavigate();
  const loaded = useGraphStore((s) => s.loaded);
  const sourceFileName = useGraphStore((s) => s.sourceFileName);
  const people = useGraphStore((s) => s.people);
  const clear = useGraphStore((s) => s.clear);
  const updatePositions = useGraphStore((s) => s.updatePositions);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showNewPerson, setShowNewPerson] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [linkStep, setLinkStep] = useState<LinkStep>('idle');
  const [linkFromId, setLinkFromId] = useState<string | null>(null);
  const [linkToId, setLinkToId] = useState<string | null>(null);

  useEffect(() => {
    if (!loaded) navigate('/', { replace: true });
  }, [loaded, navigate]);

  if (!loaded) return null;

  const selectedPerson = people.find((p) => p.id === selectedId) ?? null;
  const linkFrom = people.find((p) => p.id === linkFromId);
  const linkTo = people.find((p) => p.id === linkToId);

  const linkMode = linkStep === 'pickFrom' || linkStep === 'pickTo';

  const handleLinkPick = (id: string) => {
    if (linkStep === 'pickFrom') {
      setLinkFromId(id);
      setLinkStep('pickTo');
    } else if (linkStep === 'pickTo') {
      if (id === linkFromId) return;
      setLinkToId(id);
      setLinkStep('confirm');
    }
  };

  const cancelLink = () => {
    setLinkStep('idle');
    setLinkFromId(null);
    setLinkToId(null);
  };

  const handleNewImport = () => {
    if (
      window.confirm(
        'Return to import? Unsaved changes in memory will be lost unless you exported first.',
      )
    ) {
      clear();
      navigate('/');
    }
  };

  const handleAutoLayout = useCallback(() => {
    const storePeople = useGraphStore.getState().people;
    const storeRels = useGraphStore.getState().relationships;
    const nodes: Node[] = storePeople.map((p, i) => ({
      id: p.id,
      type: 'person',
      position: { x: p.pos_x ?? i * 50, y: p.pos_y ?? i * 50 },
      data: { person: p },
    }));
    const edges: Edge[] = storeRels.map((r) => ({
      id: r.id,
      source: r.from_id,
      target: r.to_id,
    }));
    const laid = layoutGraph(nodes, edges);
    const positions: Record<string, { x: number; y: number }> = {};
    for (const n of laid) {
      positions[n.id] = n.position;
    }
    updatePositions(positions);
  }, [updatePositions]);

  return (
    <div className="tree-screen">
      <header className="tree-header">
        <div>
          <h1>Famtree</h1>
          <div className="tree-header__file">{sourceFileName}</div>
        </div>
        <button type="button" className="btn btn--ghost" style={{ color: '#f5f0e6', borderColor: '#f5f0e6' }} onClick={handleNewImport}>
          Import
        </button>
      </header>

      <div className="tree-canvas-wrap">
        {linkMode ? (
          <div className="link-banner">
            {linkStep === 'pickFrom' ? 'Tap the first person (from)' : 'Tap the second person (to)'}
            <button
              type="button"
              style={{
                marginLeft: '0.5rem',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
              }}
              onClick={cancelLink}
            >
              Cancel
            </button>
          </div>
        ) : null}

        <ReactFlowProvider>
          <FamilyCanvas
            selectedPersonId={selectedId}
            linkFromId={linkFromId}
            linkMode={linkMode}
            onSelectPerson={setSelectedId}
            onLinkPick={handleLinkPick}
            onPositionsChange={updatePositions}
          />
        </ReactFlowProvider>

        <div className="fab-bar">
          <button
            type="button"
            className="fab fab--primary"
            onClick={() => {
              setSelectedId(null);
              setShowNewPerson(true);
            }}
          >
            + Person
          </button>
          <button
            type="button"
            className={`fab ${linkMode ? 'fab--active' : ''}`}
            onClick={() => {
              if (linkMode) cancelLink();
              else setLinkStep('pickFrom');
            }}
          >
            Link
          </button>
          <button type="button" className="fab" onClick={handleAutoLayout}>
            Arrange
          </button>
          <button type="button" className="fab" onClick={() => setShowExport(true)}>
            Export
          </button>
        </div>
      </div>

      {selectedPerson && !showNewPerson ? (
        <PersonSheet person={selectedPerson} onClose={() => setSelectedId(null)} />
      ) : null}

      {showNewPerson ? <PersonSheet person={null} isNew onClose={() => setShowNewPerson(false)} /> : null}

      {linkStep === 'confirm' && linkFrom && linkTo ? (
        <RelationshipDialog
          fromId={linkFrom.id}
          toId={linkTo.id}
          fromName={linkFrom.name}
          toName={linkTo.name}
          onClose={cancelLink}
          onSaved={cancelLink}
        />
      ) : null}

      {showExport ? <ExportDialog onClose={() => setShowExport(false)} /> : null}
    </div>
  );
}
