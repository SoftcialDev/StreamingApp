// apps/api/src/types/express/index.d.ts
import "express";
import { JwtPayload } from "express-jwt";

declare global {
  namespace Express {
    interface Request {
      /**
       * Populated by express-jwt: the decoded token payload or a string.
       */
      user?: string | JwtPayload;
    }
  }
}

// no exports – this file only augments globals
