import type { Room } from './types'
export const rooms: Room[] = [
  {
    id: 'focus',
    name: '포커스 룸',
    capacity: 4,
    image: '/images/room-four-person.png',
    description:
      '조용한 대화와 깊은 집중을 위한 프라이빗 공간. 팀 스터디부터 작은 회의까지 편안하게 이용하세요.',
    amenities: ['화이트보드', 'Wi-Fi', '콘센트'],
  },
  {
    id: 'lounge',
    name: '오픈 라운지',
    capacity: 8,
    image: '/images/hero-studyroom.png',
    description:
      '따뜻한 자연광과 넓은 테이블이 있는 열린 공간. 새로운 아이디어를 함께 나누기 좋습니다.',
    amenities: ['데스크 램프', 'Wi-Fi', '공용 테이블'],
  },
  {
    id : 'quiet',
    name: '조용한 공간',
    capacity: 2,
    image: '/images/room-two-person.png',
    description:
      '집중이 필요한 개인 작업에 최적화된 공간. 조용한 환경에서 업무와 학습에 몰입하세요.',
    amenities: ['개인 책상', 'Wi-Fi', '콘센트'],
  }
]
