import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowUpRight, Users, Clock, Check } from 'lucide-react'
import { getRooms } from '../features/rooms/api'
export default function RoomListPage() {
  const [people, setPeople] = useState(1)
  const {
    data: rooms = [],
    isPending,
    isError,
    refetch,
  } = useQuery({ queryKey: ['rooms'], queryFn: getRooms })
  const filtered = rooms.filter((room) => room.capacity >= people)
  return (
    <>
      <section className="hero container">
        <img
          src="/images/hero-studyroom.png"
          alt="햇살이 들어오는 스터디 라운지"
          fetchPriority="high"
        />
        <div className="hero-copy">
          <p className="eyebrow">A SPACE FOR YOUR NEXT IDEA</p>
          <h1>
            몰입이 시작되는
            <br />
            나만의 공간.
          </h1>
          <p>
            혼자서도, 함께여도.
            <br />
            오늘의 목표에 맞는 공간을 만나보세요.
          </p>
          <a className="button" href="#spaces">
            공간 찾아보기 <ArrowUpRight size={18} />
          </a>
        </div>
        <span className="hero-caption">STUDYROOM / 데모 공간</span>
      </section>
      <div className="container benefits">
        <span>
          <Clock size={18} /> 1시간 단위 예약
        </span>
        <span>
          <Users size={18} /> 함께 집중하는 공간
        </span>
        <span>
          <Check size={18} /> 간편한 예약 확인
        </span>
      </div>
      <section id="spaces" className="container page">
        <div className="section-heading">
          <div>
            <p className="eyebrow">OUR SPACES</p>
            <h2>어떤 공간이 필요하세요?</h2>
          </div>
          <label className="filter">
            이용 인원
            <select value={people} onChange={(e) => setPeople(Number(e.target.value))}>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}명{n === 5 ? ' 이상' : ''}
                </option>
              ))}
            </select>
          </label>
        </div>
        {isPending ? (
          <p role="status">공간을 불러오는 중입니다.</p>
        ) : isError ? (
          <div role="alert">
            공간을 불러오지 못했습니다.
            <button onClick={() => void refetch()}>다시 시도</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty">조건에 맞는 공간이 없습니다. 이용 인원을 변경해 보세요.</div>
        ) : (
          <div className="room-grid">
            {filtered.map((room) => (
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
                    {room.amenities.map((a) => (
                      <span key={a}>{a}</span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
