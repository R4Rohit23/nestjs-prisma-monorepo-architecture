/**
 * Generates a simple random password
 * @param length - Length of the password (default: 12)
 * @returns Generated password string
 */
export function generateRandomPassword(length: number = 12): string {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }

    return password;
}
