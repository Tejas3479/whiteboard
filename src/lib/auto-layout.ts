import { Editor, TLShape, TLShapeId } from 'tldraw';

export interface LayoutNode {
  id: TLShapeId;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  shapeType: string;
}

export interface LayoutEdge {
  id: TLShapeId;
  source: TLShapeId;
  target: TLShapeId;
  label?: string;
}

export interface GraphTopology {
  nodes: Map<string, LayoutNode>;
  edges: LayoutEdge[];
  inDegrees: Map<string, number>;
  outDegrees: Map<string, number>;
  adjList: Map<string, string[]>;
}

export function extractGraphFromEditor(editor: Editor): GraphTopology {
  const shapes = Array.from(editor.getCurrentPageShapes());
  const nodes = new Map<string, LayoutNode>();
  const edges: LayoutEdge[] = [];
  const inDegrees = new Map<string, number>();
  const outDegrees = new Map<string, number>();
  const adjList = new Map<string, string[]>();

  // Extract nodes (geo, text, and note shapes)
  shapes.forEach((s) => {
    if (s.type === 'geo' || s.type === 'text' || s.type === 'note') {
      const props = s.props as { w?: number; h?: number; text?: string; geo?: string };
      const node: LayoutNode = {
        id: s.id,
        label: props?.text || (s.type === 'text' ? 'Text' : s.type === 'note' ? 'Sticky Note' : 'Node'),
        x: s.x,
        y: s.y,
        w: props?.w || 160,
        h: props?.h || 80,
        shapeType: props?.geo || s.type,
      };
      nodes.set(s.id.toString(), node);
      inDegrees.set(s.id.toString(), 0);
      outDegrees.set(s.id.toString(), 0);
      adjList.set(s.id.toString(), []);
    }
  });

  // Extract edges (arrows connected to nodes or overlapping near nodes)
  shapes.forEach((s) => {
    if (s.type === 'arrow') {
      const props = s.props as {
        start?: { type?: string; boundShapeId?: TLShapeId; x?: number; y?: number };
        end?: { type?: string; boundShapeId?: TLShapeId; x?: number; y?: number };
        text?: string;
      };

      let sourceId = props?.start?.boundShapeId?.toString();
      let targetId = props?.end?.boundShapeId?.toString();

      // If arrow bindings are missing, find nearest nodes based on arrow start & end points
      if (!sourceId || !targetId) {
        const arrowX = s.x;
        const arrowY = s.y;
        const startPointX = arrowX + (props?.start?.x || 0);
        const startPointY = arrowY + (props?.start?.y || 0);
        const endPointX = arrowX + (props?.end?.x || 100);
        const endPointY = arrowY + (props?.end?.y || 0);

        let minStartDist = Infinity;
        let minEndDist = Infinity;

        nodes.forEach((n) => {
          const centerX = n.x + n.w / 2;
          const centerY = n.y + n.h / 2;
          const distStart = Math.hypot(centerX - startPointX, centerY - startPointY);
          const distEnd = Math.hypot(centerX - endPointX, centerY - endPointY);

          if (distStart < minStartDist && distStart < 250) {
            minStartDist = distStart;
            if (!sourceId) sourceId = n.id.toString();
          }
          if (distEnd < minEndDist && distEnd < 250) {
            minEndDist = distEnd;
            if (!targetId) targetId = n.id.toString();
          }
        });
      }

      if (sourceId && targetId && sourceId !== targetId && nodes.has(sourceId) && nodes.has(targetId)) {
        edges.push({
          id: s.id,
          source: sourceId as unknown as TLShapeId,
          target: targetId as unknown as TLShapeId,
          label: props?.text || '',
        });

        inDegrees.set(targetId, (inDegrees.get(targetId) || 0) + 1);
        outDegrees.set(sourceId, (outDegrees.get(sourceId) || 0) + 1);
        adjList.get(sourceId)?.push(targetId);
      }
    }
  });

  return { nodes, edges, inDegrees, outDegrees, adjList };
}

export interface ArrowUpdate {
  id: TLShapeId;
  x: number;
  y: number;
  start: Record<string, unknown>;
  end: Record<string, unknown>;
}

/**
 * Computes a clean hierarchical DAG & Grid layout to fix visual mess
 */
export function computeAutoLayout(editor: Editor): {
  nodePositions: Map<TLShapeId, { x: number; y: number }>;
  updatedArrows: ArrowUpdate[];
} {
  const { nodes, edges, inDegrees, adjList } = extractGraphFromEditor(editor);
  const nodePositions = new Map<TLShapeId, { x: number; y: number }>();
  const updatedArrows: ArrowUpdate[] = [];

  if (nodes.size === 0) {
    return { nodePositions, updatedArrows };
  }

  // Determine viewport center to place cleaned layout neatly
  const viewportBounds = editor.getViewportPageBounds();
  const centerX = viewportBounds.center.x;
  const centerY = viewportBounds.center.y;

  const nodeArray = Array.from(nodes.values());

  // Layer assignment using longest-path layering for DAGs
  const nodeLayerMap = new Map<string, number>();

  // Group nodes into layers
  const layerGroups = new Map<number, string[]>();
  nodeArray.forEach((node) => {
    const idStr = node.id.toString();
    const inDeg = inDegrees.get(idStr) || 0;
    let layer = 0;
    
    if (inDeg > 0) {
      // Find max layer of incoming predecessors + 1
      let maxPredLayer = 0;
      nodes.forEach((predNode) => {
        const predId = predNode.id.toString();
        const predNeighbors = adjList.get(predId) || [];
        if (predNeighbors.includes(idStr)) {
          maxPredLayer = Math.max(maxPredLayer, (nodeLayerMap.get(predId) || 0) + 1);
        }
      });
      layer = maxPredLayer;
    }
    
    nodeLayerMap.set(idStr, layer);
    if (!layerGroups.has(layer)) {
      layerGroups.set(layer, []);
    }
    layerGroups.get(layer)!.push(idStr);
  });

  const sortedLayerKeys = Array.from(layerGroups.keys()).sort((a, b) => a - b);
  const layers: string[][] = sortedLayerKeys.map((key) => layerGroups.get(key)!);

  // Calculate layout coordinates
  const LAYER_SPACING_X = 260; // Horizontal gap between layers
  const NODE_SPACING_Y = 140;  // Vertical gap between nodes in same layer

  const totalWidth = layers.length * LAYER_SPACING_X;
  const startX = centerX - totalWidth / 2;

  layers.forEach((layerNodes, layerIdx) => {
    const posX = startX + layerIdx * LAYER_SPACING_X;
    const totalHeight = layerNodes.length * NODE_SPACING_Y;
    const startY = centerY - totalHeight / 2;

    layerNodes.forEach((nodeId, nodeIdx) => {
      const posY = startY + nodeIdx * NODE_SPACING_Y;
      const node = nodes.get(nodeId);
      if (node) {
        nodePositions.set(node.id, { x: Math.round(posX), y: Math.round(posY) });
      }
    });
  });

  // Calculate updated arrow endpoints connecting updated node coordinates
  edges.forEach((edge) => {
    const sourcePos = nodePositions.get(edge.source);
    const targetPos = nodePositions.get(edge.target);

    if (sourcePos && targetPos) {
      const sourceNode = nodes.get(edge.source.toString());
      const targetNode = nodes.get(edge.target.toString());

      const sourceW = sourceNode?.w || 160;
      const sourceH = sourceNode?.h || 80;

      const startX = sourcePos.x + sourceW;
      const startY = sourcePos.y + sourceH / 2;

      const endX = targetPos.x;
      const endY = targetPos.y + (targetNode?.h || 80) / 2;

      const existingArrow = editor.getShape(edge.id);
      const existingProps = (existingArrow?.props || {}) as {
        start?: Record<string, unknown>;
        end?: Record<string, unknown>;
      };

      const hasStartBinding = existingProps.start?.type === 'binding';
      const hasEndBinding = existingProps.end?.type === 'binding';

      updatedArrows.push({
        id: edge.id,
        x: Math.round(startX),
        y: Math.round(startY),
        start: hasStartBinding ? existingProps.start! : { type: 'point', x: 0, y: 0 },
        end: hasEndBinding ? existingProps.end! : { type: 'point', x: endX - startX, y: endY - startY },
      });
    }
  });

  return { nodePositions, updatedArrows };
}

// Global animation state to allow cancellation of previous active cleanup animations
let activeCleanupAnimationId: number | null = null;

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Executes Mess Cleanup with smooth animated transitions
 */
export async function executeMessCleanup(editor: Editor, durationMs = 350): Promise<number> {
  if (activeCleanupAnimationId !== null) {
    cancelAnimationFrame(activeCleanupAnimationId);
    activeCleanupAnimationId = null;
  }

  const { nodePositions, updatedArrows } = computeAutoLayout(editor);

  if (nodePositions.size === 0 && updatedArrows.length === 0) return 0;

  interface NodeAnimState {
    id: TLShapeId;
    type: string;
    startX: number;
    startY: number;
    targetX: number;
    targetY: number;
  }

  interface ArrowAnimState {
    id: TLShapeId;
    startX: number;
    startY: number;
    targetX: number;
    targetY: number;
    startProp: Record<string, unknown>;
    startEndPtX: number;
    startEndPtY: number;
    targetEndPtX: number;
    targetEndPtY: number;
  }

  const nodesToAnimate: NodeAnimState[] = [];
  nodePositions.forEach((pos, shapeId) => {
    const existing = editor.getShape(shapeId);
    if (existing) {
      nodesToAnimate.push({
        id: shapeId,
        type: existing.type,
        startX: existing.x,
        startY: existing.y,
        targetX: pos.x,
        targetY: pos.y,
      });
    }
  });

  const arrowsToAnimate: ArrowAnimState[] = [];
  updatedArrows.forEach(({ id, x: targetX, y: targetY, start, end }) => {
    const existing = editor.getShape(id);
    if (existing && existing.type === 'arrow') {
      const existingProps = (existing.props || {}) as {
        end?: { x?: number; y?: number };
      };
      const curEnd = existingProps.end || { x: 0, y: 0 };
      const targetEndPt = (end as { x?: number; y?: number }) || { x: 0, y: 0 };

      arrowsToAnimate.push({
        id,
        startX: existing.x,
        startY: existing.y,
        targetX,
        targetY,
        startProp: start,
        startEndPtX: curEnd.x || 0,
        startEndPtY: curEnd.y || 0,
        targetEndPtX: targetEndPt.x || 0,
        targetEndPtY: targetEndPt.y || 0,
      });
    }
  });

  const totalCount = nodesToAnimate.length + arrowsToAnimate.length;
  if (totalCount === 0) return 0;

  return new Promise<number>((resolve) => {
    const startTime = performance.now();

    function step(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const ease = easeOutCubic(progress);

      const shapeUpdates: Array<Record<string, unknown>> = [];

      nodesToAnimate.forEach((n) => {
        shapeUpdates.push({
          id: n.id,
          type: n.type,
          x: Math.round(n.startX + (n.targetX - n.startX) * ease),
          y: Math.round(n.startY + (n.targetY - n.startY) * ease),
        });
      });

      arrowsToAnimate.forEach((a) => {
        shapeUpdates.push({
          id: a.id,
          type: 'arrow',
          x: Math.round(a.startX + (a.targetX - a.startX) * ease),
          y: Math.round(a.startY + (a.targetY - a.startY) * ease),
          props: {
            ...(editor.getShape(a.id)?.props as object),
            start: a.startProp,
            end: {
              type: 'point',
              x: Math.round(a.startEndPtX + (a.targetEndPtX - a.startEndPtX) * ease),
              y: Math.round(a.startEndPtY + (a.targetEndPtY - a.startEndPtY) * ease),
            },
          },
        });
      });

      if (shapeUpdates.length > 0) {
        editor.updateShapes(shapeUpdates as Parameters<typeof editor.updateShapes>[0]);
      }

      if (progress < 1) {
        activeCleanupAnimationId = requestAnimationFrame(step);
      } else {
        activeCleanupAnimationId = null;
        resolve(totalCount);
      }
    }

    activeCleanupAnimationId = requestAnimationFrame(step);
  });
}
