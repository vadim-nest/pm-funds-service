import type { FastifyInstance, FastifyError } from "fastify";

export class HttpError extends Error {
  statusCode: number;
  type: string;
  details?: unknown[];

  constructor(statusCode: number, type: string, message: string, details?: unknown[]) {
    super(message);
    this.statusCode = statusCode;
    this.type = type;
    this.details = details;
  }
}

type AjvValidation = Array<Record<string, unknown>>;
type FastifyValidationError = FastifyError & {
  validation?: AjvValidation;
  validationContext?: string;
};

const isFastifyValidationError = (e: unknown): e is FastifyValidationError =>
  typeof e === "object" && e !== null && "validation" in e;

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((err, _req, reply) => {
    // Zod/Fastify validation → 400
    if (isFastifyValidationError(err) && err.validation) {
      return reply.status(400).send({
        error: {
          type: "VALIDATION_ERROR",
          message: err.message,
          details: err.validation,
        },
      });
    }

    // Explicit HttpError
    if (err instanceof HttpError) {
      return reply.status(err.statusCode).send({
        error: {
          type: err.type,
          message: err.message,
          ...(err.details ? { details: err.details } : {}),
        },
      });
    }

    // Fallback
    app.log.error({ err }, "Unhandled error");
    return reply.status(500).send({
      error: {
        type: "INTERNAL_SERVER_ERROR",
        message: "Unexpected error",
      },
    });
  });
}
