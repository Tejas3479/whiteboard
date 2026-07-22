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

  // Extract nodes (geo shapes)
  shapes.forEach((s) => {
    if (s.type === 'geo') {
      const props = s.props as { w?: number; h?: number; text?: string; geo?: string };
      const node: LayoutNode = {
        id: s.id,
        label: props?.text || '',
        x: s.x,
        y: s.y,
        w: props?.w || 160,
        h: props?.h || 80,
        shapeType: props?.geo || 'rectangle',
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

/**
 * Computes a clean hierarchical DAG & Grid layout to fix visual mess
 */
export function computeAutoLayout(editor: Editor): {
  nodePositions: Map<TLShapeId, { x: number; y: number }>;
  updatedArrows: Array<{ id: TLShapeId; start: { x: number; y: number }; end: { x: number; y: number } }>;
} {
  const { nodes, edges, inDegrees, adjList } = extractGraphFromEditor(editor);
  const nodePositions = new Map<TLShapeId, { x: number; y: number }>();
  const updatedArrows: Array<{ id: TLShapeId; start: { x: number; y: number }; end: { x: number; y: number } }> = [];

  if (nodes.size === 0) {
    return { nodePositions, updatedArrows };
  }

  // Determine viewport center to place cleaned layout neatly
  const viewportBounds = editor.getViewportPageBounds();
  const centerX = viewportBounds.center.x;
  const centerY = viewportBounds.center.y;

  const nodeArray = Array.from(nodes.values());

  // Layer assignment (Topological Sort / Sugiyama-style layering)
  const layers: string[][] = [];
  const visited = new Set<string>();

  // Find root nodes (inDegree === 0)
  let currentLayer = nodeArray
    .filter((n) => (inDegrees.get(n.id.toString()) || 0) === 0)
    .map((n) => n.id.toString());

  if (currentLayer.length === 0 && nodeArray.length > 0) {
    // If graph has cycles or no in-degree 0, take first node
    currentLayer = [nodeArray[0].id.toString()];
  }

  while (currentLayer.length > 0) {
    layers.push(currentLayer);
    currentLayer.forEach((id) => visited.add(id));

    const nextLayerSet = new Set<string>();
    currentLayer.forEach((id) => {
      const neighbors = adjList.get(id) || [];
      neighbors.forEach((nbr) => {
        if (!visited.has(nbr)) {
          nextLayerSet.add(nbr);
        }
      });
    });

    currentLayer = Array.from(nextLayerSet);
  }

  // Any remaining unvisited nodes get added to a final grid layer
  const unvisitedNodes = nodeArray.filter((n) => !visited.has(n.id.toString()));
  if (unvisitedNodes.length > 0) {
    layers.push(unvisitedNodes.map((n) => n.id.toString()));
  }

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

      updatedArrows.push({
        id: edge.id,
        start: { x: 0, y: 0 },
        end: { x: endX - startX, y: endY - startY },
      });

      // Update arrow root position as well
      nodePositions.set(edge.id, { x: Math.round(startX), y: Math.round(startY) });
    }
  });

  return { nodePositions, updatedArrows };
}

/**
 * Executes Mess Cleanup with optional animated layout transition
 */
export function executeMessCleanup(editor: Editor): number {
  const { nodePositions, updatedArrows } = computeAutoLayout(editor);

  if (nodePositions.size === 0) return 0;

  const shapeUpdates: Array<Record<string, unknown>> = [];

  nodePositions.forEach((pos, shapeId) => {
    const existing = editor.getShape(shapeId);
    if (existing) {
      shapeUpdates.push({
        id: shapeId,
        type: existing.type,
        x: pos.x,
        y: pos.y,
      });
    }
  });

  updatedArrows.forEach(({ id, start, end }) => {
    const existing = editor.getShape(id);
    if (existing && existing.type === 'arrow') {
      shapeUpdates.push({
        id,
        type: 'arrow',
        props: {
          ...(existing.props as object),
          start,
          end,
        },
      });
    }
  });

  if (shapeUpdates.length > 0) {
    editor.updateShapes(shapeUpdates as Parameters<typeof editor.updateShapes>[0]);
  }

  return shapeUpdates.length;
}
