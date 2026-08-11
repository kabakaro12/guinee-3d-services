import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pg from "pg";
import crypto from "node:crypto";
import "dotenv/config";
import nodemailer from "nodemailer";
const app = express();
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
const transporter = nodemailer.createTransport({
  service:"gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "100kb" }));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300
}));
app.use(express.static("public"));

const JWT_SECRET = process.env.JWT_SECRET || "development-secret-change-me-now";

function tokenFor(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "12h" }
  );
}

function auth(req, res, next) {
  const value = req.headers.authorization || "";
  if (!value.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Connexion requise" });
  }
  try {
    req.user = jwt.verify(value.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Session invalide" });
  }
}

function admin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Accès administrateur requis" });
  }
  next();
}

async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'client',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS requests (
      id UUID PRIMARY KEY,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      service TEXT NOT NULL,
      location TEXT NOT NULL,
      requested_date DATE NOT NULL,
      details TEXT,
      status TEXT NOT NULL DEFAULT 'Demande reçue',
      quote_amount BIGINT,
      payment_status TEXT NOT NULL DEFAULT 'Non payé',
      payment_method TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase();
  if (adminEmail && process.env.ADMIN_PASSWORD) {
    const existing = await pool.query("SELECT id FROM users WHERE email=$1", [adminEmail]);
    if (!existing.rowCount) {
      const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
      await pool.query(
        `INSERT INTO users(id,name,phone,email,password_hash,role)
         VALUES($1,$2,$3,$4,$5,'admin')`,
        [
          crypto.randomUUID(),
          "Administrateur Guinée 3D",
          "+224620242979",
          adminEmail,
          hash
        ]
      );
    }
  }
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "Guinée 3D Services" });
});

app.post("/api/register", async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;
    if (!name || !phone || !email || !password || password.length < 8) {
      return res.status(400).json({ error: "Informations invalides" });
    }

    const normalized = email.trim().toLowerCase();
    const exists = await pool.query("SELECT id FROM users WHERE email=$1", [normalized]);
    if (exists.rowCount) {
      return res.status(409).json({ error: "Ce compte existe déjà" });
    }

    const hash = await bcrypt.hash(password, 12);
    const id = crypto.randomUUID();
    const result = await pool.query(
      `INSERT INTO users(id,name,phone,email,password_hash,role)
       VALUES($1,$2,$3,$4,$5,'client')
       RETURNING id,name,phone,email,role`,
      [id, name.trim(), phone.trim(), normalized, hash]
    );

    const user = result.rows[0];
    res.status(201).json({ token: tokenFor(user), user });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.post("/api/login", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
  const user = result.rows[0];

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: "E-mail ou mot de passe incorrect" });
  }

  res.json({
    token: tokenFor(user),
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role
    }
  });
});

app.get("/api/me", auth, async (req, res) => {
  const result = await pool.query(
    "SELECT id,name,phone,email,role FROM users WHERE id=$1",
    [req.user.id]
  );
  res.json({ user: result.rows[0] });
});

app.post("/api/requests", auth, async (req, res) => {
  const { service, location, requestedDate, details } = req.body;
  if (!service || !location || !requestedDate) {
    return res.status(400).json({ error: "Informations manquantes" });
  }

  const id = crypto.randomUUID();
  const result = await pool.query(
    `INSERT INTO requests
     (id,user_id,service,location,requested_date,details)
     VALUES($1,$2,$3,$4,$5,$6)
     RETURNING *`,
    [id, req.user.id, service, location, requestedDate, details || ""]
  );
try {
  const userResult = await pool.query(
    "SELECT name, phone, email FROM users WHERE id=$1",
    [req.user.id]
  );

  const client = userResult.rows[0];

  await transporter.sendMail({
    from: `"Guinée 3D Services" <${process.env.SMTP_USER}>`,
    to: process.env.NOTIFICATION_EMAIL,
    subject: `Nouvelle demande : ${service}`,
    html: `
      <h2>Nouvelle demande d'intervention</h2>
      <p><strong>Client :</strong> ${client?.name || "Non renseigné"}</p>
      <p><strong>Téléphone :</strong> ${client?.phone || "Non renseigné"}</p>
      <p><strong>E-mail :</strong> ${client?.email || "Non renseigné"}</p>
      <p><strong>Service :</strong> ${service}</p>
      <p><strong>Lieu :</strong> ${location}</p>
      <p><strong>Date :</strong> ${requestedDate}</p>
      <p><strong>Détails :</strong> ${details || "Aucun détail"}</p>
      <p><strong>Statut :</strong> Demande reçue</p>
    `
  });

  if (client?.email) {
    await transporter.sendMail({
      from: `"Guinée 3D Services" <${process.env.SMTP_USER}>`,
      to: client.email,
      subject: "Votre demande a bien été reçue",
      html: `
        <h2>Bonjour ${client.name || ""},</h2>
        <p>Votre demande auprès de <strong>Guinée 3D Services</strong> a bien été enregistrée.</p>
        <p><strong>Service :</strong> ${service}</p>
        <p><strong>Lieu :</strong> ${location}</p>
        <p><strong>Date demandée :</strong> ${requestedDate}</p>
        <p>Statut : <strong>Demande en cours de traitement</strong>.</p>
        <p>Nous vous contacterons dès que votre devis sera disponible.</p>
        <hr>
        <p>
          Guinée 3D Services<br>
          +224 624 03 39 89<br>
          3services.gn@gmail.com
        </p>
      `
    });
  }
} catch (mailError) {
  console.error("Erreur notification email :", mailError);
}
  res.status(201).json({ request: result.rows[0] })
  
});

app.get("/api/requests", auth, async (req, res) => {
  const result = await pool.query(
    `SELECT * FROM requests
     WHERE user_id=$1
     ORDER BY created_at DESC`,
    [req.user.id]
  );
  res.json({ requests: result.rows });
});

app.get("/api/admin/requests", auth, admin, async (_req, res) => {
  const result = await pool.query(`
    SELECT
      r.*,
      u.name AS customer_name,
      u.email AS customer_email,
      u.phone AS customer_phone
    FROM requests r
    JOIN users u ON u.id=r.user_id
    ORDER BY r.created_at DESC
  `);
  res.json({ requests: result.rows });
});

app.patch("/api/admin/requests/:id", auth, admin, async (req, res) => {
  const amount =
    req.body.quoteAmount === "" || req.body.quoteAmount === null
      ? null
      : Number(req.body.quoteAmount);

  const status = req.body.status || "Demande reçue";

  const result = await pool.query(
    `UPDATE requests
     SET quote_amount=$1,status=$2
     WHERE id=$3
     RETURNING *`,
    [amount, status, req.params.id]
  );

  if (!result.rowCount) {
    return res.status(404).json({ error: "Demande introuvable" });
  }

  res.json({ request: result.rows[0] });
});

app.post("/api/pay/:id", auth, async (req, res) => {
  const provider = req.body.provider;
  if (!["Orange Money", "MTN MoMo"].includes(provider)) {
    return res.status(400).json({ error: "Moyen de paiement invalide" });
  }

  const result = await pool.query(
    `SELECT * FROM requests
     WHERE id=$1 AND user_id=$2`,
    [req.params.id, req.user.id]
  );

  const request = result.rows[0];
  if (!request || !request.quote_amount) {
    return res.status(400).json({ error: "Devis non disponible" });
  }

  if (process.env.PAYMENTS_ENABLED !== "true") {
    return res.json({
      demo: true,
      message: "Paiement Mobile Money prêt à être connecté aux identifiants marchands.",
      amount: request.quote_amount,
      provider
    });
  }

  res.status(501).json({
    error: "Connexion API marchand à finaliser"
  });
});

const port = process.env.PORT || 3000;

initDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Guinée 3D Services lancé sur le port ${port}`);
    });
  })
  .catch(err => {
    console.error("Erreur PostgreSQL :", err);
    process.exit(1);
  });
