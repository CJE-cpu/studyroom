# STUDYROOM

React·TypeScript와 Spring Boot·MySQL로 만든 스터디룸 예약 포트폴리오입니다.

## 구성
- frontend: Vite + React
- backend: Java 21 + Spring Boot + JPA
- docs/database: 테이블 생성 및 공간 초기 데이터 SQL
- docs/DEPLOYMENT.md: Render + Aiven 배포 안내

## 구현 기능
공간 탐색, 회원가입, 세션 로그인·로그아웃, 시간별 예약 생성·조회·취소를 제공합니다.
서버에서 인원·시간·예약 소유자를 확인하고 DB 제약조건으로 중복 예약을 차단합니다.
예약과 회원 정보는 MySQL에 저장됩니다. 결제 기능은 포함하지 않습니다.
공간 이미지는 AI로 생성한 가상 공간입니다.

## 로컬 실행
1. docs/database의 SQL 세 파일을 순서대로 실행합니다.
2. 백엔드 실행 환경에 DB_USERNAME, DB_PASSWORD를 지정합니다.
   기본 DB 주소는 localhost:3306/studyroom입니다. 다른 주소는 DB_URL로 지정합니다.
3. backend에서 Java 21 이상으로 ./mvnw spring-boot:run을 실행합니다.
4. frontend에서 npm ci 후 npm run dev를 실행합니다.
5. Vite는 /api 요청을 localhost:8080으로 전달합니다.

## 배포
[Render + Aiven 배포 가이드](docs/DEPLOYMENT.md)를 따릅니다.
루트 Dockerfile은 프론트엔드를 빌드한 뒤 Spring Boot 정적 리소스로 포함합니다.
실제 클라우드 배포와 DB 연결은 별도 설정이 필요합니다.

## 검증
- frontend: npm run build, npm run lint
- backend: ./mvnw test
- H2 테스트 외에 실제 MySQL의 동시 예약 충돌 및 배포 환경 동작은 별도로 확인해야 합니다.
