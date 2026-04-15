import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import admin from "firebase-admin";
import firebaseConfig from "./firebase-applet-config.json" assert { type: "json" };

// Initialize Firebase Admin SDK
let db: admin.firestore.Firestore | null = null;

try {
  // Check if running in a Google Cloud environment with default credentials
  // or if GOOGLE_APPLICATION_CREDENTIALS is set
  admin.initializeApp({
    projectId: firebaseConfig.projectId,
  });
  db = admin.firestore();
  console.log("Firebase Admin SDK initialized successfully");
} catch (error) {
  console.warn("Firebase Admin initialization: Using client config only", error instanceof Error ? error.message : error);
  // For development without credentials, Firestore queries will be handled by client-side logic
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Prithvi Path Media API is running" });
  });

  app.get("/sitemap.xml", async (req, res) => {
    try {
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
      
      // Add home page
      xml += `  <url>\n    <loc>${process.env.APP_URL || 'https://example.com'}</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
      
      // Fetch articles if Firebase is available
      if (db) {
        const snapshot = await db.collection("articles")
          .where("status", "==", "published")
          .get();
        
        snapshot.docs.forEach(doc => {
          xml += `  <url>\n    <loc>${process.env.APP_URL || 'https://example.com'}/article/${doc.id}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
        });
      }
      
      xml += '</urlset>';
      
      res.header('Content-Type', 'application/xml');
      res.send(xml);
    } catch (error) {
      console.error("Sitemap error:", error);
      res.status(500).send("Error generating sitemap");
    }
  });

  app.post("/api/contact", async (req, res) => {
    const { name, email, subject, message } = req.body;

    try {
      // Send Email
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL,
        subject: `New Contact Message: ${subject}`,
        text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Contact form error:", error);
      res.status(500).json({ success: false, error: "Failed to send notification" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
