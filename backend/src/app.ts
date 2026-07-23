import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import audienceRoutes from "./routes/audience.routes.js";


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

export default app;