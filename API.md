# SynapseBoard REST API Reference 📡

Complete documentation for SynapseBoard's Next.js App Router API endpoints.

---

## 🤖 1. AI Suggestion Stream (`/api/ai/suggest`)

Streams structured architecture diagram nodes and edges in NDJSON format based on a natural language prompt.

- **URL:** `/api/ai/suggest`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`

### Request Body
```json
{
  "prompt": "AWS Serverless Architecture",
  "apiKey": "optional_openai_api_key"
}
```

### Response (`application/x-ndjson`)
```ndjson
{"type":"node","data":{"id":"aws-1","label":"CloudFront CDN","shape":"rectangle","x":100,"y":150}}
{"type":"node","data":{"id":"aws-2","label":"API Gateway","shape":"rectangle","x":350,"y":150}}
{"type":"node","data":{"id":"aws-3","label":"AWS Lambda (Fn)","shape":"ellipse","x":600,"y":100}}
{"type":"node","data":{"id":"aws-4","label":"DynamoDB Table","shape":"cylinder","x":850,"y":150}}
{"type":"edge","data":{"id":"e-aws-1","label":"HTTPS","source":"aws-1","target":"aws-2"}}
{"type":"edge","data":{"id":"e-aws-2","label":"Invoke","source":"aws-2","target":"aws-3"}}
{"type":"edge","data":{"id":"e-aws-3","label":"Read/Write","source":"aws-3","target":"aws-4"}}
{"type":"complete","data":null}
```

---

## 📐 2. Canvas Export & Mermaid Compiler (`/api/export`)

Converts canvas shapes into Mermaid markdown code syntax or returns download URLs.

- **URL:** `/api/export`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`

### Request Body
```json
{
  "roomId": "room-123",
  "format": "mermaid",
  "shapes": [
    {
      "id": "s1",
      "type": "geo",
      "props": { "geo": "rectangle", "text": "Client App" }
    },
    {
      "id": "s2",
      "type": "geo",
      "props": { "geo": "ellipse", "text": "PostgreSQL DB" }
    }
  ]
}
```

### Response (`application/json`)
```json
{
  "success": true,
  "format": "mermaid",
  "roomId": "room-123",
  "shapeCount": 2,
  "mermaidCode": "graph TD\n    N1[Client App]\n    N2((PostgreSQL DB))\n    N1 --> N2",
  "exportUrl": "/api/export/download/room-123?format=mermaid"
}
```

---

## 🚪 3. Room Management (`/api/rooms`)

Creates a new collaborative room record in Supabase Postgres (or local fallback storage).

- **URL:** `/api/rooms`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`

### Request Body
```json
{
  "name": "Microservices Architecture Session",
  "isPublic": true
}
```

### Response (`application/json`)
```json
{
  "success": true,
  "roomId": "x9a2k4n18z",
  "shareUrl": "http://localhost:3000/board/x9a2k4n18z",
  "room": {
    "id": "x9a2k4n18z",
    "name": "Microservices Architecture Session",
    "is_public": true,
    "created_at": "2026-07-22T08:00:00.000Z",
    "updated_at": "2026-07-22T08:00:00.000Z"
  }
}
```

---

## 🔍 4. Room Details (`/api/rooms/[id]`)

Fetches metadata and active member list for a room.

- **URL:** `/api/rooms/:id`
- **Method:** `GET`

### Response (`application/json`)
```json
{
  "room": {
    "id": "x9a2k4n18z",
    "name": "Architecture Room x9a2",
    "is_public": true,
    "created_at": "2026-07-22T08:00:00.000Z",
    "updated_at": "2026-07-22T08:00:00.000Z"
  },
  "members": [
    { "id": "usr-1", "name": "Alice", "role": "owner" },
    { "id": "usr-2", "name": "Bob", "role": "editor" }
  ]
}
```

---

## ✏️ 5. AI Sketch-to-Diagram (`/api/ai/sketch-to-diagram`)

Converts rough freehand paths into clean geometric diagram shapes.

- **URL:** `/api/ai/sketch-to-diagram`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`

### Request Body
```json
{
  "strokePoints": [
    { "x": 10, "y": 10 },
    { "x": 100, "y": 10 },
    { "x": 100, "y": 60 },
    { "x": 10, "y": 60 }
  ]
}
```

### Response (`application/json`)
```json
{
  "success": true,
  "detectedShape": "rectangle",
  "confidence": 0.94,
  "refinedShapeProps": {
    "x": 10,
    "y": 10,
    "w": 90,
    "h": 50,
    "geo": "rectangle"
  }
}
```
