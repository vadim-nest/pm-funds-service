import type { FastifyInstance, FastifyError } from "fastify";
import { ZodError } from "zod";

export class HttpError extends Error {
  status: number;
  type: string;
  details?: unknown[];
  constructor(status: number, type: string, message: string, details?: unknown[]) {
    super(message);
    this.status = status;
    this.type = type;
    this.details = details;
  }
}

function zodDetails(err: ZodError) {
  return err.issues.map((i) => ({
    origin: i.code,
    code: i.code,
    path: i.path,
    message: i.message,
    ...(typeof (i as any).minimum !== "undefined" ? { minimum: (i as any).minimum } : {}),
    ...(typeof (i as any).inclusive !== "undefined" ? { inclusive: (i as any).inclusive } : {}),
  }));
}

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((err: FastifyError | Error, req, reply) => {
    // Prisma unique constraint (don’t rely on instanceof; check .code)
    if ((err as any).code === "P2002") {
      const meta = (err as any).meta as { target?: string[] } | undefined;
      return reply.code(409).send({
        error: {
          type: "CONFLICT",
          message: "Unique constraint violation",
          details: meta?.target ? [{ target: meta.target }] : [],
        },
      });
    }

    // Zod validation from our own parse() calls
    if (err instanceof ZodError) {
      return reply.code(400).send({
        error: {
          type: "VALIDATION_ERROR",
          message: "Invalid request",
          details: zodDetails(err),
        },
      });
    }

    // Fastify/Ajv validation (params/body schema mismatches)
    if ((err as any).validation) {
      return reply.code(400).send({
        error: {
          type: "VALIDATION_ERROR",
          message: "Invalid request",
          details: (err as any).validation,
        },
      });
    }

    // Our explicit app errors
    if (err instanceof HttpError) {
      return reply.code(err.status).send({
        error: { type: err.type, message: err.message, details: err.details ?? [] },
      });
    }

    // Fallback
    req.log.error({ err }, "Unhandled error");
    return reply.code(500).send({ error: { type: "INTERNAL", message: "Internal server error" } });
  });
}
