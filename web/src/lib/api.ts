import { fetchAuthSession } from 'aws-amplify/auth'
import { apiUrl } from './amplify'

export interface Submission {
  clientId: string
  submissionId: string
  senderName: string
  senderEmail: string
  message: string
  metadata?: Record<string, string>
  submittedAt: string
}

export interface SubmissionsListResponse {
  clientId: string
  clientName: string
  items: Submission[]
  nextCursor?: string
}

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function idToken(): Promise<string> {
  const session = await fetchAuthSession()
  const token = session.tokens?.idToken?.toString()
  if (!token) throw new ApiError(401, 'Not signed in')
  return token
}

export async function listSubmissions(options?: {
  limit?: number
  cursor?: string
}): Promise<SubmissionsListResponse> {
  if (!apiUrl) throw new ApiError(500, 'VITE_API_URL is not configured')

  const params = new URLSearchParams()
  if (options?.limit) params.set('limit', String(options.limit))
  if (options?.cursor) params.set('cursor', options.cursor)
  const qs = params.toString()

  const token = await idToken()
  const res = await fetch(`${apiUrl}/submissions${qs ? `?${qs}` : ''}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  })

  const data = (await res.json().catch(() => ({}))) as Partial<SubmissionsListResponse> & {
    message?: string
  }

  if (!res.ok) {
    throw new ApiError(res.status, data.message || `Request failed (${res.status})`)
  }

  return data as SubmissionsListResponse
}
