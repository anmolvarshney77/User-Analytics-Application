import type { NextFunction, Request, Response } from "express";

type AsyncRoute = (req: Request, res: Response) => Promise<void>;

export function asyncHandler(fn: AsyncRoute) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res)).catch(next);
  };
}
