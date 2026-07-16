"use client";

import { Amplify } from "aws-amplify";

const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
const userPoolClientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;

export const apiUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";

export const authConfigured = Boolean(
  userPoolId && userPoolClientId && apiUrl,
);

let configured = false;

export function configureAmplify() {
  if (!authConfigured || configured) return;
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: userPoolId!,
        userPoolClientId: userPoolClientId!,
      },
    },
  });
  configured = true;
}
