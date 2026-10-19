const express = require("express");

const app = express();
const PORT = process.env.PORT || 5003;

app.use(express.json());

let records = [];
let nextId = 1;

app.get("/health", (req, res) => {
  res.json({ status: "UP", service: "order-service" });
});

app.get("/api/orders", (req, res) => {
  res.json({ count: records.length, data: records });
});

app.post("/api/orders", (req, res) => {
  const record = {
    id: nextId++,
    ...req.body,
    createdAt: new Date().toISOString()
  };

  records.push(record);

  res.status(201).json({
    message: "order created",
    data: record
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("order-service running on port " + PORT);
});
