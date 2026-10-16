import axios from 'axios'

export type SignupInput = { name: string; email: string; password: string }

export async function signup(input: SignupInput) {
  const response = await axios.post<{ id: number; name: string; email: string }>(
    '/api/auth/signup', input, { timeout: 15000 },
  )
  return response.data
}

export function signupError(error: unknown): string {
  if (!axios.isAxiosError(error)) return '회원가입 처리 중 오류가 발생했습니다.'
  if (!error.response) return '서버 응답을 확인하지 못했습니다. 잠시 후 다시 시도해주세요.'
  const data = error.response.data
  if (error.response.status === 400 && data?.errors && typeof data.errors === 'object') {
    const messages = Object.values(data.errors).filter((value): value is string => typeof value === 'string')
    if (messages.length) return messages.join(' ')
  }
  if ([400, 409].includes(error.response.status) && typeof data?.message === 'string') return data.message
  return '회원가입 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
}

export async function login(input: { email: string; password: string }) {
  const response = await axios.post<{ id: number; name: string; email: string }>(
    '/api/auth/login', input, { timeout: 15000 },
  )
  return response.data
}

export function loginError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.'
    if (error.response.status === 401) return '이메일 또는 비밀번호가 올바르지 않습니다.'
    if (error.response.status === 400) return '이메일과 비밀번호 입력을 확인해주세요.'
  }
  return '로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
}

export async function currentMember({ signal }: { signal: AbortSignal }) {
  try {
    const response = await axios.get<{ id: number; name: string; email: string }>(
      '/api/auth/me', { signal, timeout: 10000 },
    )
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) return null
    throw error
  }
}

export async function logout() {
  await axios.post('/api/auth/logout', {}, { timeout: 10000 })
}
