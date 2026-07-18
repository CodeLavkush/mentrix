import Mailgen from "mailgen";
import nodemailer from "nodemailer";

const mailGenerator = new Mailgen({
    theme: "default",
    product: {
        name: "Mentrix",
        link: "http://localhost:5173",
    },
});

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "localhost",
    port: Number(process.env.SMTP_PORT || 1025),
    secure: false,
});

type SendEmailOptions = {
    email: string;
    subject: string;
    mailgenContent: Mailgen.Content;
};

const sendEmail = async ({
    email,
    subject,
    mailgenContent,
}: SendEmailOptions) => {
    const emailTextual =
        mailGenerator.generatePlaintext(mailgenContent);

    const emailHtml =
        mailGenerator.generate(mailgenContent);

    const mail = {
        from: `"Mentrix" <no-reply@mentrix.local>`,
        to: email,
        subject,
        text: emailTextual,
        html: emailHtml,
    };

    try {
        await transporter.sendMail(mail);

        console.log(`Email sent to ${email}`);
    } catch (error) {
        console.error("Email service failed:", error);
        throw error;
    }
};

const emailVerificationMailgenContent = (
    username: string,
    otp: string,
): Mailgen.Content => {
    return {
        body: {
            name: username,
            intro: "Welcome to Mentrix! We're excited to have you on board.",
            dictionary: {
                OTP: otp,
                "Valid For": "1 minute",
            },
            outro:
                "Need help, or have questions? Just reply to this email.",
        },
    };
};

export {
    sendEmail,
    emailVerificationMailgenContent,
};