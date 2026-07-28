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
    // Allow the local dev frontend and the deployed production frontend.
    // FRONTEND_URL is set in the backend .env to your Render/Vercel frontend URL.
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:3000",
        process.env.FRONTEND_URL,
      ].filter(Boolean) as string[];

      // Allow requests with no origin (e.g. Postman, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin "${origin}" not allowed`));
      }
    },
    credentials: true, // required for cookies (refresh token)
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

app.use((err: any, req: any, res: any, next: any) => {
  console.error(err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});
export default app;