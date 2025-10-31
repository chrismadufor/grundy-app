export function generateRedemptionCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function generateUniqueRedemptionCode(
  checkExists: (code: string) => Promise<boolean>
): Promise<string> {
  let code = generateRedemptionCode();
  let attempts = 0;
  const maxAttempts = 10;

  while (await checkExists(code) && attempts < maxAttempts) {
    code = generateRedemptionCode();
    attempts++;
  }

  if (attempts >= maxAttempts) {
    throw new Error("Failed to generate unique redemption code");
  }

  return code;
}

