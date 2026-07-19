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

export {
    registerUserValidator,
    loginValidator
}