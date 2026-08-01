import {
  confirmResetPassword,
  resetPassword,
} from "aws-amplify/auth";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Start Cognito forgot-password (sends code via custom email sender). */
export async function requestPasswordReset(email: string): Promise<void> {
  await resetPassword({ username: normalizeEmail(email) });
}

/** Confirm forgot-password with code + new password. */
export async function confirmForgotPassword(
  email: string,
  code: string,
  newPassword: string,
): Promise<void> {
  await confirmResetPassword({
    username: normalizeEmail(email),
    confirmationCode: code.trim(),
    newPassword,
  });
}
