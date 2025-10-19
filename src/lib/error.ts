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

/** Narrow a Prisma unique-constraint error without importing Prisma’s types */
type PrismaUniqueErrorShape = {
  code: "P2002";
  meta?: { target?: string[] } | undefined;
};
function isPrismaUniqueError(err: unknown): err is PrismaUniqueErrorShape {
  if (typeof err !== "object" || err === null) return false;
  const maybe = err as { code?: unknown; meta?: unknown };
  if (maybe.code !== "P2002") return false;
  if (maybe.meta === undefined) return true;
  if (typeof maybe.meta !== "object" || maybe.meta === null) return false;
  // target is optional and, when present, should be string[]
  const t = (maybe.meta as Record<string, unknown>).target;
  return t === undefined || (Array.isArray(t) && t.every((x) => typeof x === "string"));
}

/** Fastify validation error shape guard */
type FastifyValidationErrorShape = FastifyError & { validation: unknown[] };
function hasFastifyValidation(err: unknown): err is FastifyValidationErrorShape {
  return typeof err === "object" && err !== null && "validation" in err;
}

/** Minimal, typed extraction for common Zod issue extras we care about */
interface TooSmallIssueLike {
  code: "too_small";
  minimum: number;
  inclusive: boolean;
  path: (string | number)[];
  message: string;
}
function zodDetails(err: ZodError) {
  return err.issues.map((i) => {
    const base: Record<string, unknown> = {
      code: i.code,
      path: i.path,
      message: i.message,
    };

    if (i.code === "too_small") {
      const zi = i as TooSmallIssueLike;
      base.minimum = zi.minimum;
      base.inclusive = zi.inclusive;
    }
    return base;
  });
}

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((err: FastifyError | Error, req, reply) => {
    // Prisma: unique constraint violation -> 409
    if (isPrismaUniqueError(err)) {
      const target =
        err.meta?.target && Array.isArray(err.meta.target) ? err.meta.target : undefined;

      return reply.code(409).send({
        error: {
          type: "CONFLICT",
          message: "Unique constraint violation",
          details: target ? [{ target }] : [],
        },
      });
    }

    // Zod validation from our parse() calls -> 400
    if (err instanceof ZodError) {
      return reply.code(400).send({
        error: { type: "VALIDATION_ERROR", message: "Invalid request", details: zodDetails(err) },
      });
    }

    // Fastify/Ajv validation (schema mismatches) -> 400
    if (hasFastifyValidation(err)) {
      return reply.code(400).send({
        error: { type: "VALIDATION_ERROR", message: "Invalid request", details: err.validation },
      });
    }

    // Our explicit domain errors
    if (err instanceof HttpError) {
      return reply
        .code(err.status)
        .send({ error: { type: err.type, message: err.message, details: err.details ?? [] } });
    }

    // Fallback
    req.log.error({ err }, "Unhandled error");
    return reply.code(500).send({ error: { type: "INTERNAL", message: "Internal server error" } });
  });
}
