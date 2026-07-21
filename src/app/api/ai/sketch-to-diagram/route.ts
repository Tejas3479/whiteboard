import { NextResponse } from 'next/server';
import { getStroke } from 'perfect-freehand';

interface StrokeInput {
  points: Array<[number, number]>;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const strokes: StrokeInput[] = body?.strokes || [];
    const context = body?.context || 'Architecture sketch';

    // Run perfect-freehand stroke vectorization
    const vectorizedStrokes = strokes.map((s) => {
      if (!s.points || s.points.length === 0) return [];
      return getStroke(s.points, { size: 8, thinning: 0.5, smoothing: 0.5 });
    });

    // Estimate bounding box & geometry shape heuristics
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    strokes.forEach((s) => {
      s.points.forEach(([x, y]) => {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      });
    });

    if (minX === Infinity) {
      minX = 100;
      minY = 100;
      maxX = 300;
      maxY = 250;
    }

    const width = maxX - minX;
    const height = maxY - minY;
    const isCircular = Math.abs(width - height) < 30;

    const shapeType = isCircular ? 'ellipse' : 'rectangle';
    const labelText = context.includes('database') ? 'Database' : 'Service Node';

    const mermaidCode = `graph TD\n    NodeA[${labelText}] --> NodeB[Target Service]`;

    const shapes = [
      {
        type: 'geo',
        x: Math.round(minX),
        y: Math.round(minY),
        props: {
          geo: shapeType,
          w: Math.max(120, Math.round(width)),
          h: Math.max(80, Math.round(height)),
          text: labelText,
          color: 'violet',
          fill: 'semi',
        },
      },
    ];

    return NextResponse.json({
      success: true,
      vectorizedCount: vectorizedStrokes.length,
      mermaidCode,
      shapes,
    });
  } catch (error) {
    console.error('Sketch-to-diagram error:', error);
    return NextResponse.json({ error: 'Failed to process sketch vectorization' }, { status: 500 });
  }
}
