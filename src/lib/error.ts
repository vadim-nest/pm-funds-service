import type { FastifyInstance, FastifyError } from "fastify";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

export class HttpError extends Error {
  constructor(
    public statusCode: number,
    public type: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

function normalizeDetails(details: unknown): Array<Record<string, unknown>> | undefined {
  if (details == null) return undefined;
  const out: Array<Record<string, unknown>> = [];

  if (Array.isArray(details)) {
    for (const d of details) {
      if (d && typeof d === "object") out.push(d as Record<string, unknown>);
      else out.push({ value: d });
    }
  } else if (details && typeof details === "object") {
    out.push(details as Record<string, unknown>);
  } else {
    out.push({ value: details });
  }

  // If we only produced empty objects, treat as undefined
  const hasSubstance = out.some((o) => Object.keys(o).length > 0);
  return hasSubstance ? out : undefined;
}

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((err: FastifyError | Error, _req, reply) => {
    // Fastify (Ajv) validation errors -> 400 with details (useful)
    if ((err as any).validation) {
      return reply.status(400).send({
        error: {
          type: "VALIDATION_ERROR",
          message: "Request validation failed",
          details: normalizeDetails((err as any).validation), // array of Ajv errors
        },
      });
    }

    // Zod validation -> 400 with details (useful)
    if (err instanceof ZodError) {
      return reply.status(400).send({
        error: {
          type: "VALIDATION_ERROR",
          message: "Invalid request payload",
          details: normalizeDetails(err.issues),
        },
      });
    }

    // Prisma known errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        // Unique constraint -> 409 (no details to avoid leaking internals)
        return reply.status(409).send({
          error: {
            type: "CONFLICT",
            message: "Resource already exists",
          },
        });
      }
      // Other known prisma error -> 400 generic
      return reply.status(400).send({
        error: {
          type: "PRISMA_ERROR",
          message: "Database request error",
        },
      });
    }

    if (err instanceof HttpError) {
      return reply.status(err.statusCode).send({
        error: {
          type: err.type || "ERROR",
          message: err.message,
          // include details only if present & meaningful
          ...(normalizeDetails(err.details) ? { details: normalizeDetails(err.details) } : {}),
        },
      });
    }

    // Fallback
    app.log.error(err, "Unhandled error");
    return reply.status(500).send({
      error: {
        type: "INTERNAL_SERVER_ERROR",
        message: "Unexpected server error",
      },
    });
  });
}
