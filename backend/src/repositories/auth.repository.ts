import prisma from "../config/prisma.js";
import { PrismaClient, Prisma } from "@prisma/client";

type DB = Prisma.TransactionClient | PrismaClient;

export class AuthRepository {

  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        workspace: true,
      },
    });
  }

  async createWorkspace(
    db: DB,
    companyName: string
  ) {
    return db.workspace.create({
      data: {
        companyName,
      },
    });
  }

  async createUser(
    db: DB,
    data: {
      name: string;
      email: string;
      password: string;
      workspaceId: string;
    }
  ) {
    return db.user.create({
      data,
      include: {
        workspace: true,
      },
    });
  }

  async createRefreshToken(
    db: DB,
    data: {
      tokenHash: string;
      userId: string;
      expiresAt: Date;
    }
  ) {
    return db.refreshToken.create({
      data,
    });
  }

  async findRefreshToken(tokenHash: string) {
  return prisma.refreshToken.findFirst({
    where: {
      tokenHash,
    },
    include: {
      user: {
        include: {
          workspace: true,
        },
      },
    },
  });
}
}