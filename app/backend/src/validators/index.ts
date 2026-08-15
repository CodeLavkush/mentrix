import { body } from "express-validator"

const registerUserValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Email is invalid"),
        body("username")
            .trim()
            .notEmpty()
            .withMessage("Username is required")
            .isLowercase()
            .withMessage("Username must be in lowercase")
            .isLength({ min: 3 })
            .withMessage("Username must be at least 3 characters long"),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password is required"),
        body("gender")
            .trim()
            .notEmpty()
            .withMessage("Gender is required"),
        body("age")
            .notEmpty()
            .withMessage("Age is required")
            .isNumeric()
            .withMessage("Age must be a number value"),
        body("avatar")
            .optional()

    ]
}

const loginValidator = () => {
    return [
        body("email")
            .optional()
            .isEmail()
            .withMessage("Email is invalid"),
        body("password")
            .notEmpty()
            .withMessage("Password is required"),
    ]
}

const profileValidator = () => {
    return [
        body("collegeName")
            .optional()
            .isString(),
        body("universityName")
            .optional()
            .isString(),
        body("course")
            .optional()
            .isString(),
        body("branch")
            .optional()
            .isString(),
        body("year")
            .optional()
            .isNumeric(),
        body("semester")
            .optional()
            .isNumeric(),
        body("rollNumber")
            .optional()
            .isNumeric(),
    ]
}

const quizValidator = () => {
    return [
        body("quizTitle")
            .isString(),
        body("difficulty")
            .isString(),
        body("totalQuestions")
            .isNumeric(),
    ]
}

const quizAttemptsValidator = () => {
    return [
        body("score")
            .isNumeric(),
        body("totalMarks")
            .isNumeric(),
        body("percentage")
            .optional()
            .isNumeric(),
        body("timeTaken")
            .isNumeric(),
    ]
}

const flashcardSetValidator = () => {
    return [
        body("title")
            .isString(),
        body("topic")
            .isString(),
        body("totalCards")
            .isNumeric(),
    ]
}

const flashcardProgressValidator = () => {
    return [
        body("reviewCount")
            .optional()
            .isNumeric(),
        body("correctCount")
            .optional()
            .isNumeric(),
        body("masteryLevel")
            .optional()
            .isNumeric(),
        body("isCorrect")
            .optional()
            .isBoolean(),
    ]
}

const noteValidator = () => {
    return [
        body("title")
            .isString(),
    ]
}

const whiteboardValidator = () => {
    return [
        body("title")
            .isString(),
        body("drawingData")
            .custom((value) => {
                if (!value) return false;
                if (typeof value === "object") return true;
                if (typeof value === "string") {
                    try {
                        JSON.parse(value);
                        return true;
                    } catch {
                        return true;
                    }
                }
                return false;
            }),
    ]
}

export {
    registerUserValidator,
    loginValidator,
    profileValidator,
    quizValidator,
    quizAttemptsValidator,
    flashcardSetValidator,
    flashcardProgressValidator,
    noteValidator,
    whiteboardValidator
}