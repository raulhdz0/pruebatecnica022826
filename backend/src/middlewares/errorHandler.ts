import { Request, Response, NextFunction } from 'express'

interface AppError extends Error {
  status?: number
}

const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction): void => {
  console.error(err)
  const status = err.status || 500
  const message = err.message || 'Internal Server Error'
  res.status(status).json({ message })
}

export default errorHandler
