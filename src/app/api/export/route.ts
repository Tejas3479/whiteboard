import { NextResponse } from 'next/server';

interface CanvasShapeInput {
  id?: string;
  type?: string;
  props?: {
    geo?: string;
    text?: string;
    w?: number;
    h?: number;
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const roomId = body?.roomId || 'default-room';
    const shapes: CanvasShapeInput[] = body?.shapes || [];
    const format = body?.format || 'mermaid';

    const nodeLines: string[] = [];
    const edgeLines: string[] = [];

    shapes.forEach((s, idx) => {
      if (s.type === 'geo') {
        const text = s.props?.text || `Node_${idx + 1}`;
        const shapeType = s.props?.geo === 'ellipse' ? `((${text}))` : `[${text}]`;
        nodeLines.push(`    N${idx + 1}${shapeType}`);
      } else if (s.type === 'arrow') {
        const sourceIdx = Math.max(1, idx);
        const targetIdx = sourceIdx + 1;
        edgeLines.push(`    N${sourceIdx} --> N${targetIdx}`);
      }
    });

    if (nodeLines.length === 0) {
      nodeLines.push('    A[Client App] --> B(API Gateway)');
      nodeLines.push('    B --> C[(PostgreSQL DB)]');
    }

    const mermaidCode = `graph TD\n${nodeLines.join('\n')}\n${edgeLines.join('\n')}`;

    return NextResponse.json({
      success: true,
      format,
      roomId,
      shapeCount: shapes.length,
      mermaidCode,
      exportUrl: `/api/export/download/${roomId}?format=${format}`,
    });
  } catch (error) {
    console.error('Export canvas error:', error);
    return NextResponse.json({ error: 'Failed to export canvas' }, { status: 500 });
  }
}
