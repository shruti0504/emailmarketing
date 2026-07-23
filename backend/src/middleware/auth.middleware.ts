import { NextFunction, Request, Response } from "express";
import prisma from "../config/prisma.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { AppError } from "../utils/AppError.js";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Authentication required.", 401);
    }

    const token = authHeader.split(" ")[1];

    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: {
        id: payload.userId,
      },
      select: {
        id: true,
        email: true,
        workspaceId: true,
      },
    });

    if (!user) {
      throw new AppError("User not found.", 401);
    }

    req.user = {
      userId: user.id,
      workspaceId: user.workspaceId,
      email: user.email,
    };

    next();
  } catch (error) {
    next(error);
  }
};