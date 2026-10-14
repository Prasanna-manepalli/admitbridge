# AdmitBridge — Local Setup Guide

## Option 1: Docker (Recommended — Easiest)

### Prerequisites
- [Docker Desktop](https://docs.docker.com/get-docker/) installed

### Steps
1. Open terminal in this folder
2. Run the setup script:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```
3. Open http://localhost:5173 in your browser
4. Use the demo login buttons to log in as Student/Consultant/Admin

### Manual Docker Commands
```bash
# Build and start all services
docker compose up --build -d

# View logs
docker compose logs -f

# Stop all services
docker compose down

# Stop and remove all data (fresh start)
docker compose down -v
```

---

## Option 2: Without Docker (Manual Setup)

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ installed
- [Python](https://python.org/) 3.10+ installed
- [MongoDB](https://www.mongodb.com/) running locally

### Steps

#### 1. Start MongoDB
```bash
mongod --dbpath ~/data/db
```

#### 2. Start Backend Server
```bash
cd server
npm install
PORT=5001 node server.js
```

#### 3. Start ML Service
```bash
cd ml
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --port 8000
```

#### 4. Start Frontend
```bash
cd client
npm install
npm run dev
```

#### 5. Open http://localhost:5173

---

## Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| 🎓 Student | anu@gmail.com | password123 |
| 💼 Consultant | priya@consultancy.com | priya123 |
| 🛡️ Admin | admin@admitbridge.com | password123 |

---

## Troubleshooting

### "Port already in use"
Another service is using the port. Stop it or change the port.

### "MongoDB connection error"
Make sure MongoDB is running: `mongod --dbpath ~/data/db`

### "Module not found"
Run `npm install` in the respective folder.

### Docker issues
Try: `docker compose down -v && docker compose up --build`
