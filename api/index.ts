import express from "express";
const app = express();

// Example route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Export for Vercel
export default app;
