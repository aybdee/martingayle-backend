"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    res
        .status(err.statusCode ? err.statusCode : 500)
        .json({ error: err.message });
};
exports.errorHandler = errorHandler;
