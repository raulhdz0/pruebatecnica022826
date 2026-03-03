import { Request, Response, NextFunction } from "express";
import { OptimisticLockError } from "sequelize";

interface AppError extends Error {
  status?: number;
}

const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction): void => {
  console.error(err);

  if (err instanceof OptimisticLockError) {
    res.status(409).json({
      message: "El registro fue modificado por otra operación. Por favor reintente.",
    });
    return;
  }

  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
};

export default errorHandler;
