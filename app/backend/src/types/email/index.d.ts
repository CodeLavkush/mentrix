import type Mailgen from "mailgen";

export type SendEmailOptions = {
    email: string;
    subject: string;
    mailgenContent: Mailgen.Content;
};