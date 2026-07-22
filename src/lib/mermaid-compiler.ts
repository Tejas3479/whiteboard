import { createShapeId, TLShapeId } from 'tldraw';

export interface MermaidNode {
  id: string;
  label: string;
  shape: 'rectangle' | 'ellipse' | 'rhombus' | 'cylinder';
}

export interface MermaidEdge {
  source: string;
  target: string;
  label?: string;
}

export interface CompiledDiagram {
  nodes: MermaidNode[];
  edges: MermaidEdge[];
  shapes: Array<Record<string, unknown>>;
}

export function parseAndCompileMermaid(
  code: string,
  center: { x: number; y: number }
): CompiledDiagram {
  const lines = code.split('\n');
  const nodesMap = new Map<string, MermaidNode>();
  const edges: MermaidEdge[] = [];
  let isHorizontal = true; // default LR / TD

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('%%')) return;

    if (trimmed.startsWith('graph') || trimmed.startsWith('flowchart')) {
      if (trimmed.includes('TD') || trimmed.includes('TB')) {
        isHorizontal = false;
      }
      return;
    }

    // Match node definitions with shapes:
    // ID[(Label)] -> Database (cylinder)
    // ID((Label)) -> Circle/Ellipse
    // ID([Label]) -> Rounded Rect
    // ID{Label}   -> Rhombus / Decision
    // ID(Label)   -> Ellipse / Rounded
    // ID[Label]   -> Rectangle
    const nodeRegex = /([A-Za-z0-9_]+)\s*(?:\[\(([^\]]+)\)\]|\(\(([^)]+)\)\)|\(\[([^\]]+)\]\)|\{([^}]+)\}|\(([^)]+)\)|\[([^\]]+)\])/g;
    
    let match;
    while ((match = nodeRegex.exec(trimmed)) !== null) {
      const id = match[1];
      let label = match[2] || match[3] || match[4] || match[5] || match[6] || match[7] || id;
      let shape: MermaidNode['shape'] = 'rectangle';

      if (match[2]) shape = 'cylinder';
      else if (match[3] || match[6]) shape = 'ellipse';
      else if (match[5]) shape = 'rhombus';
      else shape = 'rectangle';

      if (!nodesMap.has(id)) {
        nodesMap.set(id, { id, label, shape });
      }
    }

    // Match edges: A --> B, A -->|label| B, A -- label --> B
    if (trimmed.includes('-->') || trimmed.includes('---')) {
      const edgeParts = trimmed.split(/-->|---/);
      if (edgeParts.length >= 2) {
        const sourceMatch = edgeParts[0].trim().match(/([A-Za-z0-9_]+)$/);
        const targetMatch = edgeParts[1].trim().match(/^([A-Za-z0-9_]+)/);

        if (sourceMatch && targetMatch) {
          const source = sourceMatch[1];
          const target = targetMatch[1];
          
          let edgeLabel = '';
          const labelMatch = trimmed.match(/--\|([^|]+)\|-->|--\s*([^-]+)\s*-->/);
          if (labelMatch) {
            edgeLabel = (labelMatch[1] || labelMatch[2] || '').trim();
          }

          edges.push({ source, target, label: edgeLabel });

          // Ensure basic nodes exist if not explicitly defined with brackets
          if (!nodesMap.has(source)) {
            nodesMap.set(source, { id: source, label: source, shape: 'rectangle' });
          }
          if (!nodesMap.has(target)) {
            nodesMap.set(target, { id: target, label: target, shape: 'rectangle' });
          }
        }
      }
    }
  });

  const nodes = Array.from(nodesMap.values());
  const shapeIdMap = new Map<string, TLShapeId>();
  const shapes: Array<Record<string, unknown>> = [];

  // Layout calculation
  const nodePositions = new Map<string, { x: number; y: number }>();
  const columns = Math.ceil(Math.sqrt(nodes.length)) || 1;
  
  nodes.forEach((node, index) => {
    const shapeId = createShapeId();
    shapeIdMap.set(node.id, shapeId);

    const row = Math.floor(index / columns);
    const col = index % columns;

    const posX = isHorizontal
      ? center.x - (columns * 130) + col * 260
      : center.x - 100 + col * 220;
    
    const posY = isHorizontal
      ? center.y - 100 + row * 160
      : center.y - (Math.ceil(nodes.length / columns) * 90) + row * 180;

    nodePositions.set(node.id, { x: posX, y: posY });

    shapes.push({
      id: shapeId,
      type: 'geo',
      x: posX,
      y: posY,
      props: {
        geo: node.shape === 'ellipse' || node.shape === 'cylinder' ? 'ellipse' : node.shape === 'rhombus' ? 'rhombus' : 'rectangle',
        w: 160,
        h: 80,
        color: index % 3 === 0 ? 'violet' : index % 3 === 1 ? 'blue' : 'green',
        fill: 'semi',
        text: node.label,
      },
    });
  });

  // Create connecting arrows
  edges.forEach((edge) => {
    const sourcePos = nodePositions.get(edge.source);
    const targetPos = nodePositions.get(edge.target);

    if (sourcePos && targetPos) {
      shapes.push({
        id: createShapeId(),
        type: 'arrow',
        x: sourcePos.x + 80,
        y: sourcePos.y + 40,
        props: {
          start: { x: 0, y: 0 },
          end: { x: targetPos.x - sourcePos.x, y: targetPos.y - sourcePos.y },
          text: edge.label || '',
        },
      });
    }
  });

  return { nodes, edges, shapes };
}
