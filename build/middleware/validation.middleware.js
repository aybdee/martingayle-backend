"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = validateRequest;
function validateRequest(schema) {
    return (req, res, next) => {
        const validatedRequest = schema.safeParse(req.body);
        if (validatedRequest.success) {
            req.body = validatedRequest.data;
            next();
        }
        else {
            return res.status(400).json({
                error: validatedRequest.error.errors,
            });
        }
    };
}
