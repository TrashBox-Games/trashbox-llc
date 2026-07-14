import { Amplify } from 'aws-amplify'

const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID as string | undefined
const userPoolClientId = import.meta.env.VITE_COGNITO_CLIENT_ID as string | undefined

export const apiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || ''

export const authConfigured = Boolean(userPoolId && userPoolClientId && apiUrl)

if (authConfigured) {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: userPoolId!,
        userPoolClientId: userPoolClientId!,
      },
    },
  })
}
