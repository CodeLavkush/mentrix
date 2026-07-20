import type { Config } from "jest";

const config: Config = {
    preset: "ts-jest/presets/default-esm",
    testEnvironment: "node",

    extensionsToTreatAsEsm: [".ts"],

    transform: {
        "^.+\\.tsx?$": [
            "ts-jest",
            {
                useESM: true,
                tsconfig: "tsconfig.json",
            },
        ],
    },

    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },

    roots: ["<rootDir>/src"],

    testMatch: [
        "**/__tests__/**/*.test.ts",
        "**/?(*.)+(spec|test).ts",
    ],

    collectCoverageFrom: [
        "src/**/*.ts",
        "!src/server.ts",
        "!src/index.ts",
    ],

    coverageDirectory: "coverage",

    clearMocks: true,
};

export default config;