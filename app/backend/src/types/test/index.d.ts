export type MockCreatedUser = {
    id: string;
    username: string;
    gender: "MALE" | "FEMALE" | "OTHER" | null;
    age: number | null;
    email: string;
    isEmailVerified: boolean;
    avatarKey: string | null;
};


export type MockCreatedUserWithoutAvatar = {
    id: string;
    username: string;
    gender: "MALE" | "FEMALE" | "OTHER" | null;
    age: number | null;
    email: string;
    isEmailVerified: boolean;
};