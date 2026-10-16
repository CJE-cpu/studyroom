import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signup, signupError } from '../features/auth/api'
export default function SignupPage() {
  const navigate = useNavigate()
  const submitting = useRef(false)
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState('')
  const [userName, setUserName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (submitting.current) return
    setMessage('')
    if (!userName.trim() || !email.trim() || !password || !confirmPassword) {
      setMessage('모든 필드를 입력해주세요.')
      return
    }
    if (password !== confirmPassword) {
      setMessage('비밀번호가 일치하지 않습니다.')
      return
    }
    submitting.current = true
    setPending(true)
    try {
      await signup({ name: userName.trim(), email: email.trim(), password })
      navigate('/login', { replace: true, state: { signupComplete: true } })
    } catch (error) {
      setMessage(signupError(error))
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
        <p className="eyebrow">START YOUR FOCUS</p>
        <h1>함께 시작해요.</h1>
        <p className="muted">이메일로 가입하고 나에게 맞는 공간을 찾아보세요.</p>
        <label>
          이름
          <input
            name="name"
            autoComplete="name"
            required
            maxLength={40}
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </label>
        <label>
          이메일
          <input
            type="email"
            name="email"
            autoComplete="email" maxLength={254}
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          비밀번호
          <input
            type="password"
            name="password"
            autoComplete="new-password"
            minLength={8} maxLength={64}
            required
            placeholder="8자 이상"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <label>
          비밀번호 확인
          <input
            type="password"
            name="confirm"
            autoComplete="new-password"
            minLength={8} maxLength={64}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </label>
        <button className="button full" type="submit" disabled={pending}>
          {pending ? '가입 처리 중…' : '회원가입'}
        </button>
        {message && <p role="status">{message}</p>}
        <Link to="/login">로그인으로 돌아가기</Link>
      </form>
    </section>
  )
}
