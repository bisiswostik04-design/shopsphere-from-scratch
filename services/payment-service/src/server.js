const express = require("express");

const app = express();
const PORT = process.env.PORT || 5004;

app.use(express.json());

let records = [];
let nextId = 1;

app.get("/health", (req, res) => {
  res.json({ status: "UP", service: "payment-service" });
});

app.get("/api/payments", (req, res) => {
  res.json({ count: records.length, data: records });
});

app.post("/api/payments", (req, res) => {
  const record = {
    id: nextId++,
    ...req.body,
    createdAt: new Date().toISOString()
  };

  records.push(record);

  res.status(201).json({
    message: "payment created",
    data: record
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("payment-service running on port " + PORT);
});
