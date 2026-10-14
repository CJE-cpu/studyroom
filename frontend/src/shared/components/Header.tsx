import { Link, NavLink } from 'react-router-dom'
import style from './Header.module.scss'

export default function Header() {
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
        <Link className={style.button + ' ' + style.secondary + ' ' + style.small} to="/login">
          로그인
        </Link>
        <Link className={style.button + ' ' + style.small} to="/signup">
          회원가입
        </Link>
      </div>
    </header>
  )
}
