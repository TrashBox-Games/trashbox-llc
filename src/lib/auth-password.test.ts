import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("aws-amplify/auth", () => ({
  resetPassword: vi.fn(),
  confirmResetPassword: vi.fn(),
}));

import {
  confirmResetPassword,
  resetPassword,
} from "aws-amplify/auth";
import {
  confirmForgotPassword,
  requestPasswordReset,
} from "./auth-password";

describe("auth password reset helpers", () => {
  beforeEach(() => {
    vi.mocked(resetPassword).mockReset();
    vi.mocked(confirmResetPassword).mockReset();
  });

  it("requestPasswordReset normalizes email and calls Amplify", async () => {
    vi.mocked(resetPassword).mockResolvedValue({} as never);
    await requestPasswordReset("Owner@Example.com");
    expect(resetPassword).toHaveBeenCalledWith({
      username: "owner@example.com",
    });
  });

  it("confirmForgotPassword normalizes email and code", async () => {
    vi.mocked(confirmResetPassword).mockResolvedValue(undefined as never);
    await confirmForgotPassword(
      " Owner@Example.com ",
      " 123456 ",
      "new-password",
    );
    expect(confirmResetPassword).toHaveBeenCalledWith({
      username: "owner@example.com",
      confirmationCode: "123456",
      newPassword: "new-password",
    });
  });
});
