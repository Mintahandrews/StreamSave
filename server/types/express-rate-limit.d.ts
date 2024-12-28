declare module "express-rate-limit" {
  import { Request, Response, NextFunction } from "express";

  interface Options {
    windowMs?: number;
    max?: number;
    message?: string | object;
    statusCode?: number;
    headers?: boolean;
    draft_polli_ratelimit_headers?: boolean;
    skipFailedRequests?: boolean;
    skipSuccessfulRequests?: boolean;
    keyGenerator?: (req: Request) => string;
    handler?: (req: Request, res: Response, next: NextFunction) => void;
    skip?: (req: Request) => boolean;
  }

  function rateLimit(
    options?: Options
  ): (req: Request, res: Response, next: NextFunction) => void;
  export = rateLimit;
}
