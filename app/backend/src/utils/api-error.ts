class ApiError extends Error {
    public readonly statusCode: number;
    public readonly success: false;
    public readonly errors: unknown[];
    public readonly data: null;
    constructor(
        statusCode: number,
        message = "Something went wrong",
        errors: unknown[] = [],
        stack?: string
    ) {
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors

        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export {
    ApiError
}