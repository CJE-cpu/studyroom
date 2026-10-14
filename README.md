# STUDYROOM

React + TypeScript 기반 스터디룸 예약 서비스 포트폴리오입니다.

## 구성
- frontend: Vite 프론트엔드
- backend: Spring Boot 백엔드 개발 예정
- docs: 이미지 생성 기록 및 프로젝트 문서

## 실행
```sh
cd frontend
npm install
npm run dev
```

## 구현한 기능
- 메인 페이지, 공간 목록·상세, 인원 필터
- 날짜·시간 선택 및 데모 예약
- 브라우저에 저장한 예약 조회·취소
- 로그인·회원가입 UI (실제 인증 미연결)
- 반응형 레이아웃

## 범위
예약은 localStorage에만 저장됩니다. 실제 공간 예약·결제·인증은 수행하지 않습니다.
다중 사용자 예약 충돌 및 권한 검증은 백엔드 개발 단계에서 구현할 예정입니다.
공간 이미지는 AI로 생성한 가상 공간입니다. 생성 기록은 docs/assets/visual-assets.md를 확인하세요.

## 검증
frontend에서 npm run build 및 npm run lint를 실행합니다.