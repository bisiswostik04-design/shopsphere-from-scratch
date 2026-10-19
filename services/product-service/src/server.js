const express = require("express");

const app = express();
const PORT = process.env.PORT || 5002;

app.use(express.json());

let products = [
  { id: 1, name: "iPhone 16 Pro", price: 99999, stock: 25 },
  { id: 2, name: "MacBook Air M4", price: 114999, stock: 15 },
  { id: 3, name: "Sony Headphones", price: 34999, stock: 30 }
];
let nextId = 4;

app.get("/health", (req, res) => {
  res.json({ status: "UP", service: "product-service" });
});

app.get("/api/products", (req, res) => {
  res.json({ count: products.length, data: products });
});

app.get("/api/products/:id", (req, res) => {
  const product = products.find(
    item => item.id === Number(req.params.id)
  );

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  res.json({ data: product });
});

app.post("/api/products", (req, res) => {
  const { name, price, stock = 0 } = req.body;

  if (
    typeof name !== "string" || !name.trim() ||
    typeof price !== "number" || !Number.isFinite(price) ||
    price < 0 ||
    !Number.isInteger(stock) || stock < 0
  ) {
    return res.status(400).json({
      error: "Provide a name, non-negative numeric price and non-negative integer stock"
    });
  }

  const product = { id: nextId++, name: name.trim(), price, stock };
  products.push(product);

  res.status(201).json({
    message: "Product created",
    data: product
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Product Service running on port ${PORT}`);
});
