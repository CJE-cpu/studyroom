import { useState } from 'react'
import { Link } from 'react-router-dom'
export default function LoginPage() {
  const [message, setMessage] = useState('')
  return (
    <section className="container page">
      <form
        className="panel auth-form"
        onSubmit={(e) => {
          e.preventDefault()
          setMessage('로그인 화면이 준비됐습니다. 실제 인증은 백엔드 연결 후 제공됩니다.')
        }}
      >
        <p className="eyebrow">WELCOME BACK</p>
        <h1>다시 만나 반가워요.</h1>
        <p className="muted">현재는 화면 체험 단계로, 입력 정보는 전송·저장하지 않습니다.</p>
        <label>
          이메일
          <input type="email" autoComplete="email" required placeholder="you@example.com" />
        </label>
        <label>
          비밀번호
          <input type="password" autoComplete="current-password" required minLength={8} />
        </label>
        <button className="button full">로그인 화면 확인</button>
        {message && <p role="status">{message}</p>}
        <p>
          처음 방문하셨나요? <Link to="/signup">회원가입</Link>
        </p>
      </form>
    </section>
  )
}
