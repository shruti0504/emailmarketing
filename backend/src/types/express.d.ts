import "express";

declare global {
  namespace Express {
    interface Request {
      user: {
        userId: string;
        workspaceId: string;
        email: string;
      };
    }
  }
}

export {};