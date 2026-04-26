# MongoLens — 3D Asset Explorer

An interactive MongoDB learning platform built for a Big Data class.  
Query a dataset of **550+ 3D model records** (Khronos GLBs + Poly Haven metadata) through guided lessons, with a live Three.js viewer for models that have GLB files.

## Stack

- **Frontend** — Vanilla HTML/CSS/JS + Three.js (no build step)
- **Backend** — Node.js + Express
- **Database** — MongoDB 7 (via Docker)
- **Dataset** — Khronos glTF Sample Assets (CC0) + Poly Haven (CC0)

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Node.js 18+](https://nodejs.org/)

---

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/mongolens.git
cd mongolens
```

### 2. Start MongoDB with Docker

```bash
docker compose up -d
```

This starts MongoDB on port `27017` with:
- Username: `admin`
- Password: `password123`

Data is persisted in a Docker volume (`mongo_data`) — your database survives container restarts.

### 3. Install dependencies

```bash
npm install
```

### 4. Seed the database

```bash
node seed.js
```

This will:
- Build 300 Khronos GLB model records (with real 3D model URLs)
- Fetch ~250 Poly Haven model records live from their public API
- Create indexes on all query fields
- Takes about 30–60 seconds

Expected output:
```
📦 Building Khronos records (real GLBs with PBR materials)...
   ✅ 300 Khronos records
🌐 Fetching Poly Haven model list...
   ✅ Got ~250 Poly Haven records
✅ assetsDB.models → ~550 documents
```

### 5. Start the backend

```bash
node server.js
```

### 6. Open the frontend

Open `frontend/index.html` directly in your browser. No dev server needed.

---

## Stopping / Restarting

```bash
# Stop MongoDB (data is saved in the volume)
docker compose stop

# Start it again later
docker compose start

# Remove everything including data
docker compose down -v
```

---

## Project Structure

```
mongolens/
├── frontend/
│   └── index.html       # Full frontend (single file)
├── server.js            # Express API
├── seed.js              # Database seeder
├── package.json
├── docker-compose.yml   # MongoDB container
└── README.md
```

---

## Environment Variables

Override defaults by setting environment variables before running:

```bash
MONGO_URI=mongodb://admin:password123@localhost:27017/?authSource=admin node server.js
PORT=3001 node server.js
```

---

## Dataset

| Source | Records | 3D Model | Image |
|--------|---------|----------|-------|
| Khronos glTF Sample Assets | ~300 | ✅ GLB with PBR | ✅ |
| Poly Haven | ~250 | ❌ | ✅ Thumbnail |

Cards marked **3D · GLB** open a Three.js viewer with full PBR materials and orbit controls (drag, scroll, pinch).  
Cards marked **IMG** show a high-quality rendered preview image.

---

## License

Dataset: CC0 (Khronos, Poly Haven)  
Code: MIT