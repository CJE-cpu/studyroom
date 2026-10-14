import { useState } from 'react'
import { Link } from 'react-router-dom'
export default function SignupPage() {
  const [message, setMessage] = useState('')
  return (
    <section className="container page">
      <form
        className="panel auth-form"
        onSubmit={(e) => {
          e.preventDefault()
          const data = new FormData(e.currentTarget)
          setMessage(
            data.get('password') === data.get('confirm')
              ? '입력 확인이 완료됐습니다. 실제 가입은 백엔드 연결 후 제공됩니다.'
              : '비밀번호가 일치하지 않습니다.',
          )
        }}
      >
        <p className="eyebrow">START YOUR FOCUS</p>
        <h1>함께 시작해요.</h1>
        <p className="muted">입력 정보는 전송·저장하지 않습니다.</p>
        <label>
          이름
          <input name="name" autoComplete="name" required maxLength={40} />
        </label>
        <label>
          이메일
          <input type="email" name="email" autoComplete="email" required />
        </label>
        <label>
          비밀번호
          <input
            type="password"
            name="password"
            autoComplete="new-password"
            minLength={8}
            required
            placeholder="8자 이상"
          />
        </label>
        <label>
          비밀번호 확인
          <input
            type="password"
            name="confirm"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>
        <button className="button full">가입 정보 확인</button>
        {message && <p role="status">{message}</p>}
        <Link to="/login">로그인으로 돌아가기</Link>
      </form>
    </section>
  )
}
