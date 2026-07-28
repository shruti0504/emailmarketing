import { NextFunction, Request, Response } from "express";
import prisma from "../config/prisma.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { AppError } from "../utils/AppError.js";
import jwt from "jsonwebtoken";
// export const authMiddleware = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       throw new AppError("Authentication required.", 401);
//     }

//     const token = authHeader.split(" ")[1];

//     const payload = verifyAccessToken(token);

//     const user = await prisma.user.findUnique({
//       where: {
//         id: payload.userId,
//       },
//       select: {
//         id: true,
//         email: true,
//         workspaceId: true,
//       },
//     });

//     if (!user) {
//       throw new AppError("User not found.", 401);
//     }

//     req.user = {
//       userId: user.id,
//       workspaceId: user.workspaceId,
//       email: user.email,
//     };

//     next();
// } catch (error: any) {
//   console.error("[Auth Middleware]", error);

//   if (
//     error.name === "TokenExpiredError" ||
//     error.name === "JsonWebTokenError"
//   ) {
//     return res.status(401).json({
//       success: false,
//       message: error.message,
//     });
//   }

//   return res.status(500).json({
//     success: false,
//     message: "Internal Server Error",
//   });
// }
// };


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

  } catch (error: any) {
    console.error("[Auth Middleware]", error);
    console.log("ERROR NAME:", error?.name);
    console.log("ERROR MESSAGE:", error?.message);

    if (
      error instanceof jwt.TokenExpiredError ||
      error instanceof jwt.JsonWebTokenError ||
      error?.name === "TokenExpiredError" ||
      error?.name === "JsonWebTokenError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Access token expired",
      });
    }

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};