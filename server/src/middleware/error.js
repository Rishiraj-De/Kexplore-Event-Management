import mongoose from 'mongoose';
import { env } from '../config/env.js';

export function notFound(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  let status = err.status || err.statusCode || 500;
  let message = err.message || 'Something went wrong';
  let details = err.details;

  if (err instanceof mongoose.Error.ValidationError) {
    status = 422;
    message = 'Validation failed';
    details = Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v.message]));
  } else if (err instanceof mongoose.Error.CastError) {
    status = 400;
    message = `Invalid ${err.path}`;
  } else if (err?.code === 11000) {
    status = 409;
    message = 'This record already exists';
  } else if (err?.type === 'entity.parse.failed') {
    status = 400;
    message = 'Malformed JSON body';
  }

  if (status >= 500) {
    console.error('✖', req.method, req.originalUrl, err);
    if (env.isProd) message = 'Internal server error';
  }

  res.status(status).json({ error: message, ...(details && { details }) });
}
