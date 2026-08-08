export type Question = {
    id: string,
    quizId: string,
    question: string | null,
    option_a: string | null,
    option_b: string | null,
    option_c: string | null,
    option_d: string | null,
    correct_option: string | null,
    explanation: string | null
}