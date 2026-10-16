import { useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { currentMember, logout } from '../../features/auth/api'
import style from './Header.module.scss'

export default function Header() {
  const client = useQueryClient()
  const navigate = useNavigate()
  const {
    data: member,
    isPending,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: currentMember,
    retry: false,
  })
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState('')
  const submitting = useRef(false)
  const handleLogout = async () => {
    if (submitting.current) return
    submitting.current = true
    setPending(true)
    setMessage('')
    try {
      await logout()
      await client.cancelQueries({ queryKey: ['auth', 'me'] })
      await client.cancelQueries({ queryKey: ['reservations'] })
      client.removeQueries({ queryKey: ['reservations'] })
      client.setQueryData(['auth', 'me'], null)
      navigate('/', { replace: true })
    } catch {
      setMessage('로그아웃하지 못했습니다. 다시 시도해주세요.')
    } finally {
      submitting.current = false
      setPending(false)
    }
  }
  return (
    <header className={style.siteHeader}>
      <div className={style.container}>
        <Link to="/" aria-label="스터디룸 홈">
          <img className={style.brand} src="/brand/studyroom-logo.svg" alt="STUDYROOM" />
        </Link>
        <nav aria-label="주 메뉴">
          <NavLink to="/" end>
            홈
          </NavLink>
          <NavLink to="/rooms">공간 둘러보기</NavLink>
          <NavLink to="/reservations">내 예약</NavLink>
        </nav>
        <div className={style.authActions}>
          {isPending ? (
            <span role="status">로그인 확인 중…</span>
          ) : member ? (
            <>
              <span className={style.memberName} title={member.name}>
                {member.name}님
              </span>
              <button
                className={style.button + ' ' + style.secondary + ' ' + style.small}
                type="button"
                disabled={pending}
                onClick={handleLogout}
              >
                {pending ? '로그아웃 중…' : '로그아웃'}
              </button>
            </>
          ) : (
            <>
              <Link
                className={style.button + ' ' + style.secondary + ' ' + style.small}
                to="/login"
              >
                로그인
              </Link>
              <Link className={style.button + ' ' + style.small} to="/signup">
                회원가입
              </Link>
            </>
          )}
          {isError && (
            <div className={style.authError} role="status">
              로그인 상태를 확인할 수 없습니다. 서버 연결을 확인해 주세요.
              <button
                type="button"
                className={style.button + ' ' + style.small}
                disabled={isFetching}
                onClick={() => {
                  void refetch()
                }}
              >
                {isFetching ? '확인 중…' : '다시 시도'}
              </button>
            </div>
          )}
          {message && (
            <span className={style.authError} role="alert">
              {message}
            </span>
          )}
        </div>
      </div>
    </header>
  )
}
