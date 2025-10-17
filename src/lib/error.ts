import type { FastifyInstance, FastifyError } from "fastify";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

type ErrorType = "VALIDATION_ERROR" | "NOT_FOUND" | "CONFLICT" | "INTERNAL";

function sendError(
  reply: any,
  statusCode: number,
  type: ErrorType,
  message: string,
  details?: unknown,
) {
  return reply.status(statusCode).send({
    error: { type, message, ...(details ? { details } : {}) },
  });
}

// Lightweight helpers you can throw from routes if you prefer
export class HttpError extends Error {
  constructor(
    public statusCode: number,
    public type: ErrorType,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((err: FastifyError | ZodError | any, _req, reply) => {
    // Explicit HttpError from our code
    if (err instanceof HttpError) {
      return sendError(reply, err.statusCode, err.type, err.message, err.details);
    }

    // Zod validation
    if (err instanceof ZodError) {
      return sendError(reply, 400, "VALIDATION_ERROR", "Invalid request", err.issues);
    }

    // Prisma known errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      // Unique constraint
      if (err.code === "P2002") {
        return sendError(reply, 409, "CONFLICT", "Unique constraint violated", {
          target: (err.meta as any)?.target,
        });
      }
      // Record not found
      if (err.code === "P2025") {
        return sendError(reply, 404, "NOT_FOUND", "Resource not found");
      }
    }

    // If Fastify set a statusCode already (e.g., 404), keep it
    const status = (err as any).statusCode ?? 500;
    const type: ErrorType =
      status === 404 ? "NOT_FOUND" : status === 400 ? "VALIDATION_ERROR" : "INTERNAL";
    const message =
      (err as any).message ??
      (status === 404 ? "Not found" : status === 400 ? "Invalid request" : "Internal Server Error");

    app.log.error(err);
    return sendError(reply, status, type, message);
  });
}
