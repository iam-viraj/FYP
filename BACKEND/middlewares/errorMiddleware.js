export default class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

export const errorMiddleware = (err, req, res, next) => {
    err.message = err.message || "Internal Server Error";
    err.statusCode = err.statusCode || 500;

    // Handle MongoDB duplicate key error
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} value entered`;
        err = new ErrorHandler(message, 400);
    }

    // Handle invalid JSON Web Token error
    if (err.name === "JsonWebTokenError") {
        const message = "Your token is invalid, please log in again";
        err = new ErrorHandler(message, 400);
    }

    // Handle invalid MongoDB CastError
    if (err.name === "CastError") {
        const message = `Resource not found: ${err.path}`;
        err = new ErrorHandler(message, 400);
    }

    // Handle Mongoose validation errors
    const errorMessage = err.errors
        ? Object.values(err.errors)
              .map(error => error.message)
              .join(" ")
        : err.message;

    return res.status(err.statusCode).json({
        success: false,
        message: errorMessage,
    });
};
