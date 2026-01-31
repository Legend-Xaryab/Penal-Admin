const express = require("express");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const multer = require("multer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DB = "database.json";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(session({
  secret: "henrix-secret",
  resave: false,
  saveUninitialized: true
}));

const upload = multer({ dest: "public/uploads/" });

const readDB = () => JSON.parse(fs.readFileSync(DB));
const writeDB = data => fs.writeFileSync(DB, JSON.stringify(data, null, 2));

/* AUTH */
app.post("/api/signup", async (req, res) => {
  const db = readDB();
  const hash = await bcrypt.hash(req.body.password, 10);

  db.users.push({
    id: Date.now(),
    username: req.body.username,
    password: hash,
    role: "user"
  });

  writeDB(db);
  res.json({ success: true });
});

app.post("/api/login", async (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.username === req.body.username);

  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return res.status(401).json({ error: "Invalid login" });
  }

  req.session.user = user;
  res.json({ role: user.role });
});

/* SERVICES */
app.get("/api/services", (req, res) => {
  res.json(readDB().services);
});

/* ORDER */
app.post("/api/order", upload.single("proof"), (req, res) => {
  if (!req.session.user) return res.status(401).end();

  const db = readDB();

  db.orders.push({
    id: Date.now(),
    user: req.session.user.username,
    services: JSON.parse(req.body.services),
    total: req.body.total,
    proof: req.file.filename,
    status: "Pending",
    date: new Date().toLocaleString()
  });

  writeDB(db);

  const whatsapp = "923XXXXXXXXX"; // YOUR NUMBER
  res.json({
    whatsapp: `https://wa.me/${whatsapp}?text=New Order from ${req.session.user.username}`
  });
});

/* ADMIN */
app.get("/api/admin/orders", (req, res) => {
  res.json(readDB().orders);
});

app.listen(PORT, () => console.log("Henrix Panel running on port " + PORT));
