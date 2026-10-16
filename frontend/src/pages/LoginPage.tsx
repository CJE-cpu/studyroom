import { useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { login, loginError } from '../features/auth/api'
export default function LoginPage() {
  const client = useQueryClient()
  const navigate = useNavigate()
  const submitting = useRef(false)
  const [pending, setPending] = useState(false)
  const location = useLocation()
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (submitting.current) return
    setMessage('')
    if (!email || !password) {
      setMessage('모든 필드를 입력해주세요.')
      return
    }
    submitting.current = true
    setPending(true)
    try {
      const member = await login({ email: email.trim(), password })
      await client.cancelQueries({ queryKey: ['auth', 'me'] })
      client.setQueryData(['auth', 'me'], member)
      navigate('/', { replace: true })
    } catch (error) {
      setMessage(loginError(error))
    } finally {
      submitting.current = false
      setPending(false)
    }
  }
  return (
    <section className="container page">
      <form
        className="panel auth-form"
        onSubmit={handleSubmit} aria-busy={pending}
      >
        <p className="eyebrow">WELCOME BACK</p>
        <h1>다시 만나 반가워요.</h1>
        {location.state?.signupComplete === true && <p role="status">회원가입이 완료됐습니다. 가입한 계정으로 로그인해주세요.</p>}
        <p className="muted">가입한 이메일과 비밀번호로 로그인하세요.</p>
        <label>
          이메일
          <input
            type="email"
            autoComplete="email" maxLength={254}
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          비밀번호
          <input
            type="password"
            autoComplete="current-password"
            required
            minLength={8} maxLength={64}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button className="button full" type="submit" disabled={pending}>{pending ? '로그인 중…' : '로그인'}</button>
        {message && <p role="status">{message}</p>}
        <p>
          처음 방문하셨나요? <Link to="/signup">회원가입</Link>
        </p>
      </form>
    </section>
  )
}
