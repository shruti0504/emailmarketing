import express from "express";
import "./workers/campaign.worker.js";

const app = express();

app.get("/", (req, res) => {
  res.send("Worker is running");
});

const PORT = Number(process.env.PORT) || 10000;

app.listen(PORT, () => {
  console.log(`Worker health server running on ${PORT}`);
});