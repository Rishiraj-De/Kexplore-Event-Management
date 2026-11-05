import { HttpError } from '../utils/helpers.js';

const toFieldErrors = (issues) =>
  issues.reduce((acc, issue) => {
    const key = issue.path.join('.') || '_';
    acc[key] ??= issue.message;
    return acc;
  }, {});

/**
 * Validate `req[source]` against a Zod schema. The parsed (coerced, trimmed) value is
 * stored on `req.valid[source]` — Express 5 makes `req.query` read-only.
 */
export const validate =
  (schema, source = 'body') =>
  (req, _res, next) => {
    const result = schema.safeParse(req[source] ?? {});
    if (!result.success) {
      throw new HttpError(422, 'Please fix the highlighted fields', toFieldErrors(result.error.issues));
    }
    req.valid ??= {};
    req.valid[source] = result.data;
    next();
  };
