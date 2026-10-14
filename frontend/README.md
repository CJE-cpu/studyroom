# Studyroom frontend

React + TypeScript + Vite 기반 공간 예약 서비스의 프론트엔드 틀입니다.

## 실행

- npm install
- npm run dev
- npm run build
- npm run lint

## 페이지

- /rooms: 공간 목록, 이용 인원 필터
- /rooms/:id: 공간 상세, 날짜·1시간 단위 예약 선택
- /reservations/:id/complete: 데모 예약 완료
- /reservations: 이 브라우저에 저장한 예약 조회·취소
- /login, /signup: 회원 화면 및 기본 입력 검증
- 없는 주소와 공간: 안내 화면

## 현재 범위

이미지와 공간 데이터는 시연용입니다. 예약은 localStorage에만 저장되며 실제 예약·결제·인증은 수행하지 않습니다.
동일 브라우저의 시간 충돌을 확인하지만 여러 사용자 간 동시 예약 방지는 서버에서 구현해야 합니다.
비밀번호는 저장하거나 전송하지 않습니다. 데모 시간은 브라우저의 로컬 시간 기준입니다.

## 백엔드 연결

공간 조회: src/features/rooms/api.ts
예약 저장: src/features/reservations/store.ts
위 모듈을 API 호출로 교체하고, 서버에서 인증·예약 충돌·시간 및 권한 검증을 구현하세요.
기능별 폴더와 기존 SCSS 파일은 이후 개발용으로 유지했습니다.
