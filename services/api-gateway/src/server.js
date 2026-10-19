
const express = require("express");
const http = require("http");

const app = express();
const PORT = process.env.PORT || 18082;

// Local URLs are used by default.
// Docker Compose overrides these using environment variables.
const routes = {
  users: process.env.UPSTREAM_USERS || "http://127.0.0.1:5001",
  products: process.env.UPSTREAM_PRODUCTS || "http://127.0.0.1:5002",
  orders: process.env.UPSTREAM_ORDERS || "http://127.0.0.1:5003",
  payments: process.env.UPSTREAM_PAYMENTS || "http://127.0.0.1:5004",
  notifications:
    process.env.UPSTREAM_NOTIFICATIONS || "http://127.0.0.1:5005"
};

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    service: "api-gateway",
    routes: Object.keys(routes)
  });
});

// Forward API requests to the appropriate microservice.
app.use("/api", (req, res) => {
  const originalUrl = req.originalUrl;
  const serviceName = originalUrl.split("?")[0].split("/")[2];
  const target = routes[serviceName];

  if (!target) {
    return res.status(404).json({
      error: "Unknown API route",
      availableRoutes: Object.keys(routes)
    });
  }

  let upstream;

  try {
    upstream = new URL(target);
  } catch (error) {
    console.error("Invalid upstream URL:", target);

    return res.status(500).json({
      error: "Invalid upstream configuration"
    });
  }

  console.log(
    `Forwarding ${req.method} ${originalUrl} to ${target}`
  );

  const proxyReq = http.request(
    {
      hostname: upstream.hostname,
      port: upstream.port || 80,
      method: req.method,
      path: originalUrl,
      headers: {
        ...req.headers,
        host: upstream.host
      },
      timeout: 10000
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
      proxyRes.pipe(res);
    }
  );

  proxyReq.on("timeout", () => {
    proxyReq.destroy(new Error("Upstream request timed out"));
  });

  proxyReq.on("error", (err) => {
    console.error(
      `Proxy error for ${serviceName}:`,
      err.message
    );

    if (!res.headersSent) {
      res.status(502).json({
        error: "Upstream service unavailable",
        service: serviceName
      });
    } else {
      res.destroy(err);
    }
  });

  req.on("aborted", () => {
    proxyReq.destroy();
  });

  req.pipe(proxyReq);
});

// Handle unknown routes.
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found"
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API Gateway running on port ${PORT}`);
});
