const express = require("express");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());

let users = [
  { id: 1, name: "Demo Customer", email: "demo@shopsphere.local" }
];
let nextId = 2;

app.get("/health", (req, res) => {
  res.json({ status: "UP", service: "user-service" });
});

app.get("/api/users", (req, res) => {
  res.json({ count: users.length, data: users });
});

app.post("/api/users", (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      error: "name and email are required"
    });
  }

  const user = { id: nextId++, name, email };
  users.push(user);

  res.status(201).json({
    message: "User created",
    data: user
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`User Service running on port ${PORT}`);
});
