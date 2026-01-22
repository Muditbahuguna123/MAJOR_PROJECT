import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("iot.db");

db.run(`
  CREATE TABLE IF NOT EXISTS sensor_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    temperature REAL,
    humidity REAL,
    soil INTEGER,
    time TEXT
  )
`);

app.post("/api/sensor", (req, res) => {
  const { temperature, humidity, soil } = req.body;

  db.run(
    "INSERT INTO sensor_data (temperature, humidity, soil, time) VALUES (?, ?, ?, ?)",
    [temperature, humidity, soil, new Date().toISOString()]
  );

  console.log("Data received:", req.body);
  res.json({ status: "ok" });
});

app.get("/api/data", (req, res) => {
  db.all("SELECT * FROM sensor_data ORDER BY id DESC LIMIT 20", (err, rows) => {
    res.json(rows);
  });
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
