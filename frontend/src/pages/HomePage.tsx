import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, CalendarDays, Clock3, Users, CheckCircle2 } from 'lucide-react'
import { useRooms } from '../features/rooms/useRooms'
import styles from './HomePage.module.scss'

const steps = [
  {
    number: '01',
    title: '나에게 맞는 공간 찾기',
    description: '공간의 분위기와 시설, 수용 인원을 살펴보세요.',
    Icon: Users,
  },
  {
    number: '02',
    title: '집중할 시간 선택하기',
    description: '원하는 날짜와 예약 가능한 시간을 선택하세요.',
    Icon: CalendarDays,
  },
  {
    number: '03',
    title: '내 예약에서 확인하기',
    description: '예약 내용을 확인하고 시작 전에는 취소할 수 있어요.',
    Icon: CheckCircle2,
  },
]

export default function HomePage() {
  const { data: rooms = [], isPending, isError, refetch } = useRooms()
  return (
    <div className={styles.home}>
      <section className={styles.hero}>
        <img
          className={styles.heroImage}
          src="/images/hero-studyroom.png"
          alt="자연광과 나무 테이블이 있는 스터디 라운지"
          fetchPriority="high"
        />
        <div className={styles.shade} />
        <div className="container">
          <div className={styles.copy}>
            <p className="eyebrow">ROOM FOR YOUR NEXT CHAPTER</p>
            <h1>
              좋은 공간에서,
              <br />더 나은 시작.
            </h1>
            <p className={styles.description}>
              작은 아이디어가 자라는 곳.
              <br />
              혼자만의 몰입부터 함께하는 도전까지,
              <br />
              당신의 다음 시간을 위한 공간을 만나보세요.
            </p>
            <div className={styles.links}>
              <Link className="button" to="/rooms">
                내게 맞는 공간 찾기 <ArrowRight size={18} />
              </Link>
              <a href="#how-it-works">이용 방법 알아보기</a>
            </div>
          </div>
        </div>
        <span className={styles.caption}>STUDYROOM · 가상 공간 이미지</span>
      </section>
      <div className={'container ' + styles.quickBar}>
        <div>
          <span className={styles.dot} />
          <span>오늘의 집중을 위한 준비</span>
        </div>
        <span>
          <Clock3 size={18} /> 1시간 단위 예약
        </span>
        <span>
          <CalendarDays size={18} /> 원하는 날짜 선택
        </span>
        <Link to="/reservations">
          내 예약 확인 <ArrowUpRight size={17} />
        </Link>
      </div>
      <section className={'container ' + styles.section} aria-labelledby="recommended-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">FIND YOUR FOCUS</p>
            <h2 id="recommended-title">어떤 하루를 계획하고 있나요?</h2>
            <p className={styles.subtext}>공간마다 다른 분위기, 목표에 맞는 선택.</p>
          </div>
          <Link className={styles.textLink} to="/rooms">
            모든 공간 보기 <ArrowRight size={18} />
          </Link>
        </div>
        <div className="room-grid">
          {isPending && <p role="status">공간을 불러오는 중입니다.</p>}
          {isError && (
            <div role="alert">
              <p>공간을 불러오지 못했습니다.</p>
              <button
                className="button secondary"
                onClick={() => {
                  void refetch()
                }}
              >
                다시 시도
              </button>
            </div>
          )}
          {!isPending && !isError && rooms.length === 0 && <p>등록된 공간이 없습니다.</p>}
          {rooms.slice(0, 2).map((room) => (
            <Link className="room-card" key={room.id} to={'/rooms/' + room.id}>
              <div className="room-photo">
                <img src={room.image} alt={room.name + ' 내부'} loading="lazy" />
                <span className="badge">최대 {room.capacity}명</span>
              </div>
              <div className="room-body">
                <div className="row">
                  <h3>{room.name}</h3>
                  <ArrowUpRight size={22} />
                </div>
                <p>{room.description}</p>
                <div className="tags">
                  {room.amenities.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section id="how-it-works" className={styles.guide} aria-labelledby="guide-title">
        <div className="container">
          <p className="eyebrow">LESS PLANNING, MORE FOCUS</p>
          <h2 id="guide-title">예약은 간단하게, 집중은 깊게.</h2>
          <div className={styles.steps}>
            {steps.map(({ number, title, description, Icon }) => (
              <article key={number}>
                <div className={styles.stepTop}>
                  <Icon size={26} strokeWidth={1.5} />
                  <span>{number}</span>
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className={'container ' + styles.section}>
        <div className={styles.invitation}>
          <div>
            <p className="eyebrow">MAKE ROOM FOR YOUR IDEAS</p>
            <h2>당신의 다음 아이디어를 기다립니다.</h2>
            <p>지금, 집중할 공간을 골라보세요.</p>
          </div>
          <Link className="button" to="/rooms">
            공간 둘러보기 <ArrowRight size={18} />
          </Link>
        </div>
        <p className={styles.demo}>
          현재는 예약 흐름을 체험하는 데모 서비스입니다. 실제 예약이나 결제는 발생하지 않습니다.
        </p>
      </section>
    </div>
  )
}
