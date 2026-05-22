import express from "express";
import path from "path";
import admin from "firebase-admin";

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || "pote-sagrado-casais",
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body parser
  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Simple in-memory rate limiting (Replace with Redis for production)
  const usageLimits: Record<string, { count: number, lastReset: number }> = {};
  const DAILY_LIMIT = 5;

  // Example Gemini proxy route
  app.post("/api/gemini", async (req, res) => {
    try {
      // 1. App Check Verification (Optional but recommended)
      const appCheckToken = req.header("X-Firebase-App-Check");
      if (process.env.NODE_ENV === "production" && !appCheckToken) {
         // return res.status(401).json({ error: "Unauthorized: Missing App Check token" });
         // Keeping it relaxed for dev, but ready for production
      }

      // 2. Verify Firebase ID Token
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized: Missing token" });
      }

      const idToken = authHeader.split("Bearer ")[1];
      let decodedToken;
      try {
        decodedToken = await admin.auth().verifyIdToken(idToken);
      } catch (authError) {
        console.error("Auth Error:", authError);
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
      }

      // 3. Usage Limits (Rate Limiting)
      const uid = decodedToken.uid;
      const now = Date.now();
      const today = new Date().setHours(0,0,0,0);

      if (!usageLimits[uid] || usageLimits[uid].lastReset < today) {
        usageLimits[uid] = { count: 0, lastReset: now };
      }

      if (usageLimits[uid].count >= DAILY_LIMIT) {
        return res.status(429).json({ error: "Limite diário de uso da I.A. atingido. Tente novamente amanhã!" });
      }

      usageLimits[uid].count++;

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Missing Gemini API Key." });
      }
      
      const { prompt } = req.body;
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });
      
      const data = await response.json();
      res.json(data);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  }).on('error', (err) => {
    console.error('Express server failed to start:', err);
  });
}

startServer().catch(err => {
  console.error('Server execution failed:', err);
});
