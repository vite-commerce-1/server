export const errorHandler = (err, req, res, next) => {
  let resStatusCode = res.statusCode === 200 ? 500 : res.statusCode;

  let message = err.message;

  if (err.name === "ValidationError") {
    message = Object.values(err.errors)
      .map((value) => value.message)
      .join(", ");
    resStatusCode = 400;
  }

  res.status(resStatusCode).json({
    message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

export const notFoundPath = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};
