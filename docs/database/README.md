# 회원 DB 연결

## 1. MySQL에 테이블 생성
MySQL Workbench에서 001-members.sql을 열고 실행합니다.
기존 데이터는 삭제하지 않습니다. 기존 members 구조가 다르면 변경 전 확인이 필요합니다.

## 2. 앱 전용 계정
관리자 연결에서 아래 SQL의 비밀번호를 직접 바꿔 실행하세요. 실제 비밀번호는 Git에 저장하지 마세요.

```sql
CREATE USER 'studyroom_app'@'localhost' IDENTIFIED BY '여기에_새_비밀번호';
GRANT SELECT, INSERT, UPDATE, DELETE ON studyroom.* TO 'studyroom_app'@'localhost';
```

이미 같은 계정이 있다면 새로 만들지 말고 기존 계정 설정을 확인하세요.

## 3. Spring Tools 환경변수
Run > Run Configurations > Spring Boot App > backend 실행 설정 > Environment > Add에서 등록:
- DB_USERNAME: studyroom_app
- DB_PASSWORD: 위에서 직접 설정한 비밀번호
- DB_URL: 기본 localhost:3306이 아닌 경우에만 지정

Apply 후 실행합니다. 설정 파일은 환경변수를 읽으며 .env 파일을 자동으로 읽지는 않습니다.
JPA는 validate 모드로 테이블 구조만 확인합니다. DB/테이블/환경변수 준비 전에는 서버 실행이 실패합니다.

## 회원 데이터
- id: 자동 증가 회원 번호
- email: 소문자·앞뒤 공백 제거, 중복 불가
- password_hash: 비밀번호 해시 전용(원문 저장 금지)
- name: 이름, 최대 40자
- role: 기본 USER, 관리자 권한은 가입 요청으로 받지 않음
- created_at: 생성 시각

다음 단계는 회원가입 Service에서 비밀번호를 PasswordEncoder로 해시 처리하고 MemberRepository로 저장하는 것입니다.
이 작업에는 회원가입 API나 암호화 구현이 포함되지 않습니다.
엔티티를 API 응답으로 직접 반환하지 말고, passwordHash를 제외한 DTO를 사용하세요.

## 테스트
테스트는 별도 H2 메모리 DB를 사용하므로 실제 MySQL 데이터에 영향을 주지 않습니다.
H2 테스트 성공이 MySQL 연결 성공을 의미하지는 않습니다.
