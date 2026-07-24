import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import audienceRoutes from "./routes/audience.routes.js";
import campaignRoutes from "./routes/campaign.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";


const app = express();

app.use(express.json());

app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);


app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactRoutes);
app.use(
  "/api/audiences",
  audienceRoutes
);
app.use(
  "/api/campaigns",
  campaignRoutes
);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Email Marketing API is running",
  });
});

app.use(
  "/api/webhooks",
  webhookRoutes
);
export default app;