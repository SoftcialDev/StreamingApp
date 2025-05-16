import "express";  
import { JwtPayload } from "express-jwt";

declare global {
  namespace Express {
    /**
     * Populated by express-jwt middleware
     */
    interface Request {
      user?: string | JwtPayload;
    }
  }
}
