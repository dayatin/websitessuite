/**
 * Cloudflare Turnstile Server-Side Verification Helper
 */

export interface TurnstileVerificationResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
}

export async function verifyTurnstileToken(
  secretKey: string,
  token: string,
  remoteIp?: string,
): Promise<{ success: boolean; errors?: string[] }> {
  // Allow test tokens during local development / testing
  if (secretKey === "TEST_SECRET_KEY" && token === "TEST_TOKEN_VALID") {
    return { success: true };
  }

  if (!token) {
    return { success: false, errors: ["missing-input-response"] };
  }

  try {
    const formData = new FormData();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (remoteIp) {
      formData.append("remoteip", remoteIp);
    }

    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
    });

    const result = (await response.json()) as TurnstileVerificationResponse;
    return {
      success: result.success,
      errors: result["error-codes"],
    };
  } catch (error) {
    return {
      success: false,
      errors: [(error as Error).message],
    };
  }
}
