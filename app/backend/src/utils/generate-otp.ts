export function otpKey(email: string): string {
    return `otp:${email}`
}

export function generateOTP(): { otp: string, otpExpiry: number } {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const otpExpiry = 60 // 1 minute

    return { otp, otpExpiry };
};