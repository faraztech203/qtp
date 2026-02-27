import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import multer from "multer";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import Database from "better-sqlite3";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("database.sqlite");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'admin'
  );

  CREATE TABLE IF NOT EXISTS licenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    fatherName TEXT,
    cnic TEXT UNIQUE,
    licenseNo TEXT UNIQUE,
    branch TEXT,
    type TEXT,
    category TEXT,
    issueDate TEXT,
    expiryDate TEXT,
    status TEXT,
    photoUrl TEXT
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER,
    action TEXT,
    target_id TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed Admin User if not exists
const seedAdmin = () => {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const existing = db.prepare("SELECT * FROM users WHERE email = ?").get(adminEmail);
  
  if (!existing) {
    const hashedPassword = bcrypt.hashSync(adminPassword, 10);
    db.prepare("INSERT INTO users (email, password, role) VALUES (?, ?, ?)").run(adminEmail, hashedPassword, "admin");
    console.log("Admin user seeded.");
  }
};
seedAdmin();

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-123";

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for development with Vite
}));
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Rate Limiting for Login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: "Too many login attempts, please try again later."
});

// Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const token = req.cookies.token;
  if (!token) return res.status(404).send("Not Found"); // Requirement: return 404 for unauthorized

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(404).send("Not Found");
    if (user.role !== 'admin') return res.status(404).send("Not Found");
    req.user = user;
    next();
  });
};

// Audit Logger Helper
const logAction = (adminId: number, action: string, targetId: string) => {
  db.prepare("INSERT INTO audit_logs (admin_id, action, target_id) VALUES (?, ?, ?)").run(adminId, action, targetId);
};

// --- API ROUTES ---

// Public Search API
app.get("/api/licenses/search/:cnic", (req, res) => {
  const cnic = req.params.cnic.replace(/-/g, '');
  const license = db.prepare("SELECT * FROM licenses WHERE REPLACE(cnic, '-', '') = ?").get(cnic);
  if (license) {
    res.json(license);
  } else {
    res.status(404).json({ error: "Record not found" });
  }
});

// Admin Login
app.post("/api/admin/login", loginLimiter, (req, res) => {
  const { email, password } = req.body;
  const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

  if (user && bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "8h" });
    res.cookie("token", token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production",
      sameSite: "none", // Required for iframe context
      maxAge: 8 * 60 * 60 * 1000 
    });
    res.json({ success: true, user: { email: user.email, role: user.role } });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

app.post("/api/admin/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ success: true });
});

// Check Auth Status
app.get("/api/admin/me", authenticateToken, (req: any, res) => {
  res.json({ user: req.user });
});

// Protected CRUD Routes
app.get("/api/admin/licenses", authenticateToken, (req, res) => {
  const licenses = db.prepare("SELECT * FROM licenses ORDER BY id DESC").all();
  res.json(licenses);
});

app.post("/api/admin/licenses", authenticateToken, (req: any, res) => {
  const { name, fatherName, cnic, licenseNo, branch, type, category, issueDate, expiryDate, status, photoUrl } = req.body;
  try {
    const result = db.prepare(`
      INSERT INTO licenses (name, fatherName, cnic, licenseNo, branch, type, category, issueDate, expiryDate, status, photoUrl)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, fatherName, cnic, licenseNo, branch, type, category, issueDate, expiryDate, status, photoUrl);
    
    logAction(req.user.id, "CREATE_LICENSE", result.lastInsertRowid.toString());
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put("/api/admin/licenses/:id", authenticateToken, (req: any, res) => {
  const { id } = req.params;
  const { name, fatherName, cnic, licenseNo, branch, type, category, issueDate, expiryDate, status, photoUrl } = req.body;
  try {
    db.prepare(`
      UPDATE licenses SET 
        name = ?, fatherName = ?, cnic = ?, licenseNo = ?, branch = ?, 
        type = ?, category = ?, issueDate = ?, expiryDate = ?, status = ?, photoUrl = ?
      WHERE id = ?
    `).run(name, fatherName, cnic, licenseNo, branch, type, category, issueDate, expiryDate, status, photoUrl, id);
    
    logAction(req.user.id, "UPDATE_LICENSE", id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/api/admin/licenses/:id", authenticateToken, (req: any, res) => {
  const { id } = req.params;
  db.prepare("DELETE FROM licenses WHERE id = ?").run(id);
  logAction(req.user.id, "DELETE_LICENSE", id);
  res.json({ success: true });
});

// --- VITE MIDDLEWARE ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
