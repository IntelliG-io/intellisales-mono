import apiClient, { ApiError } from '../apiClient'

export type TenantInfo = {
  id: string
  name: string
  subscriptionStatus: 'active' | 'expired' | null
}

export type StoreInfo = {
  id: string
  name: string
  location: string | null
}

export type MeUser = {
  id: string
  name: string | null
  email: string
  role: string
  status: 'active' | 'inactive'
  tenant: TenantInfo | null
  store: StoreInfo | null
}

export type MeResponse = {
  user: MeUser
  token?: string
}

export async function getProfile(): Promise<MeResponse> {
  try {
    const { data } = await apiClient.get<MeResponse>('/api/auth/me')
    return data
  } catch (err) {
    throw err as ApiError
  }
}
