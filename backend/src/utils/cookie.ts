import { Response } from "express";
import { env } from "../config/env.js";

export const setRefreshTokenCookie = (
  res: Response,
  refreshToken: string
) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    // "none" required for cross-origin (different domains in production).
    // "lax" works for same-site (same domain, different port in dev is still cross-origin
    // but most browsers send lax cookies for top-level navigations).
    // For deployed apps where frontend and backend are on different domains,
    // use "none" + secure:true.
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const clearRefreshTokenCookie = (res: Response) => {
  res.clearCookie("refreshToken");
};