import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export const validateBody = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issue = error.issues[0];
        const message = issue ? `${issue.path.join(".")}: ${issue.message}` : "Validation failed";
        return res.status(400).json({
          success: false,
          message,
          errors: error.flatten().fieldErrors,
        });
      }
      next(error);
    }
  };
};

export const validateParams = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync(req.params);
      req.params = parsed as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: "Invalid parameter format",
          errors: error.flatten().fieldErrors,
        });
      }
      next(error);
    }
  };
};
