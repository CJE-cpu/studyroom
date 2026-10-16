# 데이터베이스 및 실행 안내

## 테이블 준비
MySQL Workbench에서 아래 파일을 순서대로 실행합니다.
1. 001-members.sql: 회원 테이블
2. 002-rooms.sql: 공간·편의시설 테이블과 초기 데이터
3. 003-reservations.sql: 예약 테이블과 활성 예약 중복 방지 제약

이미 적용한 SQL을 반복 실행하지 마세요. 특히 002의 초기 INSERT와 003의 CREATE TABLE은 최초 적용용입니다.
기존 데이터는 삭제하지 말고 실제 테이블 구조를 먼저 확인하세요.
JPA ddl-auto=validate는 생성 컬럼과 고유 인덱스의 존재까지 보장하지 않습니다.
SHOW CREATE TABLE reservations로 active_slot과 uk_reservations_active_slot을 확인하세요.

## 서버 환경 변수
Spring Tools의 Run Configurations > Spring Boot App > Environment에서 설정합니다.
- DB_USERNAME: 앱 전용 MySQL 계정
- DB_PASSWORD: 해당 계정 비밀번호
- DB_URL: 기본 localhost:3306/studyroom과 다른 경우 설정

앱 계정에는 studyroom DB의 SELECT, INSERT, UPDATE, DELETE 권한이 필요합니다.
테이블 생성은 별도 관리 계정으로 진행합니다. 비밀번호는 저장소에 올리지 마세요.
Spring은 .env 파일을 자동으로 읽지 않습니다.

## 실행
BackendApplication을 실행해 Started 로그를 확인한 뒤 frontend에서 npm run dev를 실행합니다.
Vite 개발 서버의 /api 요청은 localhost:8080으로 전달됩니다.
다른 프로젝트가 5173을 사용하는 경우 터미널에 출력되는 실제 포트로 접속하세요.

## 구현 상태
- 회원가입, 비밀번호 해시, 세션 로그인, 회원 조회, 로그아웃
- DB 공간 조회
- 회원별 예약 생성·조회·취소
- 예약 가능 시간 조회와 정원·날짜·권한 검증
- 프론트엔드 예약 API 연결 (기존 브라우저 데모 예약은 이관하지 않음)

## 테스트
backend에서 mvnw.cmd test, frontend에서 npm run build 및 npm run lint를 실행합니다.
자동 테스트는 H2 임시 DB를 사용하며 실제 MySQL 데이터를 수정하지 않습니다.
예약 서비스 테스트는 생성·중복 조회·취소·재예약·권한·날짜·정원을 검증합니다.
MySQL의 생성 컬럼과 고유 제약을 이용한 동시 예약 차단은 별도 MySQL 테스트가 필요합니다.

## 배포 전 남은 작업
- 세션 인증에 맞는 CSRF 방어와 HTTPS 쿠키 설정
- MySQL 동시 예약 테스트
- DB 백업 및 마이그레이션 자동화
- 실제 브라우저에서 로그인부터 예약 취소까지 확인
