export type User = {
    id: string,
    username: string | null,
    email: string | null,
    gender: string | null,
    age: number | null,
    isEmailVerified: boolean | null,
    refreshToken: string | null,
}