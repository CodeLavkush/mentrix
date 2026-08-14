import { ApiError } from "../utils/api-error.js";

export class BaseQuery {

    protected async require<T>(
        query: () => Promise<T | null>,
        statusCode: number,
        message: string
    ): Promise<T> {

        const result = await query();

        if (result === null) {
            throw new ApiError(
                statusCode,
                message
            );
        }

        return result;
    }


    protected async forbid<T>(
        query: () => Promise<T | null>,
        statusCode: number,
        message: string
    ): Promise<void> {

        const result = await query();

        if (result !== null) {
            throw new ApiError(
                statusCode,
                message
            );
        }
    }
}