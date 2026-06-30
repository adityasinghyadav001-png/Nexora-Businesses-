# NEXORA Backend API

> Production-ready Node.js + Express + MongoDB backend for the NEXORA AI-powered SaaS platform.

---

## 📁 Project Structure

```
nexora-backend/
├── server/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── openai.js          # OpenAI client setup
│   ├── controllers/
│   │   ├── chatController.js  # AI chat logic
│   │   └── leadController.js  # Lead capture logic
│   ├── models/
│   │   └── Lead.js            # Mongoose Lead schema
│   ├── routes/
│   │   ├── chatRoutes.js      # POST /api/chat
│   │   └── leadRoutes.js      # POST /api/lead, GET /api/lead
│   ├── utils/
│   │   └── helpers.js         # Response helpers + logger
│   └── server.js              # Entry point
├── .env.example               # Template for environment variables
├── .gitignore
├── package.json
└── README.md
```

---

## ⚙️ Quick Start

### 1. Install dependencies

```bash
cd nexora-backend
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nexora
OPENAI_API_KEY=sk-your-key-here
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:5500
```

### 3. Run the server

```bash
# Development (auto-restarts on file changes)
npm run dev

# Production
npm start
```

You should see:
```
✅ MongoDB Connected: localhost
╔══════════════════════════════════════════════╗
║          NEXORA Backend is running           ║
║  🌐  http://localhost:5000                   ║
║  🤖  Chat:   POST /api/chat                  ║
║  📩  Leads:  POST /api/lead                  ║
╚══════════════════════════════════════════════╝
```

---

## 🔌 API Reference

### Health Check
```
GET /health
```
Response:
```json
{ "status": "ok", "service": "NEXORA Backend", "environment": "development" }
```

---

### 🤖 AI Chat — `POST /api/chat`

**Request Body:**
```json
{
  "message": "What services does NEXORA offer?",
  "history": []
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "AI response generated",
  "data": {
    "reply": "NEXORA offers AI-powered chatbots, website development, automation...",
    "usage": { "totalTokens": 145 }
  }
}
```

**Rate limit:** 15 requests per minute per IP.

---

### 📩 Capture Lead — `POST /api/lead`

**Request Body:**
```json
{
  "name": "Priya Sharma",
  "businessType": "E-commerce",
  "whatsapp": "+919876543210",
  "source": "landing-page"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Thank you! Our team will contact you on WhatsApp within 24 hours.",
  "data": { "leadId": "6671a...", "name": "Priya Sharma" }
}
```

**Validation Error (422):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": { "whatsapp": "Enter a valid WhatsApp number (e.g. +919876543210)" }
}
```

**Rate limit:** 5 submissions per 15 minutes per IP.

---

### 📋 Get All Leads — `GET /api/lead`

```
GET /api/lead?status=new&limit=20&page=1
```

> ⚠️ **Add authentication middleware before going to production!**

---

## 🧪 Testing

### Using Postman

1. Import the following cURL commands:

**Chat:**
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Tell me about NEXORA services"}'
```

**Lead:**
```bash
curl -X POST http://localhost:5000/api/lead \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "businessType": "Restaurant", "whatsapp": "+911234567890"}'
```

### Using JavaScript fetch()

```javascript
// Chat
const response = await fetch("http://localhost:5000/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message: "What can NEXORA do for me?" })
});
const data = await response.json();
console.log(data.data.reply);

// Lead capture
const res = await fetch("http://localhost:5000/api/lead", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Ayesha Khan",
    businessType: "Consultancy",
    whatsapp: "+919898989898"
  })
});
const lead = await res.json();
console.log(lead.message);
```

---

## 🌐 Frontend Integration

### Connecting your HTML/JS frontend

```html
<!-- index.html -->
<script>
const API_BASE = "https://your-backend.onrender.com"; // or localhost:5000

// ── Chat widget ───────────────────────────────────────────────
const chatHistory = [];

async function sendMessage(userMessage) {
  chatHistory.push({ role: "user", content: userMessage });

  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userMessage, history: chatHistory })
  });

  const data = await res.json();

  if (data.success) {
    chatHistory.push({ role: "assistant", content: data.data.reply });
    return data.data.reply;
  } else {
    throw new Error(data.message);
  }
}

// ── Lead capture form ─────────────────────────────────────────
document.getElementById("lead-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;

  try {
    const res = await fetch(`${API_BASE}/api/lead`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.value,
        businessType: form.businessType.value,
        whatsapp: form.whatsapp.value,
        source: "homepage"
      })
    });

    const data = await res.json();

    if (data.success) {
      alert(data.message); // Replace with a nicer toast notification
      form.reset();
    } else {
      console.error("Errors:", data.errors);
    }
  } catch (err) {
    console.error("Network error:", err);
  }
});
</script>
```

---

## 🚀 Deployment

### Render.com (Recommended — Free tier available)

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your repository
4. Set:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add Environment Variables in the Render dashboard (same as `.env`)
6. Deploy!

### Railway.app

```bash
# Install Railway CLI
npm install -g @railway/cli

railway login
railway init
railway up
```

Set env vars in the Railway dashboard under **Variables**.

### Environment Variables for Production

| Variable | Description |
|---|---|
| `PORT` | Set automatically by Render/Railway |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `OPENAI_API_KEY` | Your OpenAI key |
| `ALLOWED_ORIGINS` | Your live frontend domain |
| `NODE_ENV` | `production` |

---

## 🔐 Security Checklist

- [x] API keys in `.env` — never hardcoded
- [x] `.env` in `.gitignore` — never committed
- [x] Helmet.js for secure HTTP headers
- [x] CORS whitelist — only trusted origins
- [x] Rate limiting on all endpoints
- [x] Request body size limit (10 KB)
- [x] Input validation before DB writes
- [x] Mongoose validation as second layer
- [ ] Add JWT authentication for `/api/lead` GET in production
- [ ] Switch to Redis-backed rate limiting for multi-instance deployments

---

## 📦 Dependencies

| Package | Purpose |
|---|---|
| `express` | Web framework |
| `mongoose` | MongoDB ODM |
| `openai` | OpenAI API client |
| `dotenv` | Environment variables |
| `cors` | Cross-origin requests |
| `helmet` | Security headers |
| `express-rate-limit` | Rate limiting |
| `validator` | String validation utilities |
| `nodemon` *(dev)* | Auto-restart on file change |
