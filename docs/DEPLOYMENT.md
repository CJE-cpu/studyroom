# Render + Aiven 배포

React 빌드 결과를 Spring Boot JAR에 포함합니다. 사용자는 Render 주소 하나로 화면과 API에 접근합니다.
Dockerfile은 프론트 린트·빌드와 백엔드 테스트를 실행합니다.

## 1. Aiven MySQL
1. Aiven에 가입하고 MySQL의 **Free** 요금제를 선택합니다. 유료 체험 플랜과 구분하세요.
2. 서비스가 실행되면 Host, Port, User, Password를 확인하고 CA 인증서를 다운로드합니다.
3. Workbench에 새 연결을 만들고 해당 Host/Port/User를 입력합니다.
4. SSL에서 CA 인증서를 지정하고 서버 인증서를 검증하는 모드로 연결합니다.
5. SQL 파일을 순서대로 한 번 실행합니다:
   - docs/database/001-members.sql
   - docs/database/002-rooms.sql
   - docs/database/003-reservations.sql
6. 이 스크립트는 studyroom DB를 생성합니다. defaultdb가 아닌 studyroom으로 앱을 연결하세요.
   DB 생성 권한 오류가 발생하면 중단하고 권한을 확인합니다. 기존 DB/테이블을 삭제하지 마세요.
7. 가능하면 앱 전용 DB 사용자를 만들어 studyroom.*에 SELECT, INSERT, UPDATE, DELETE 권한만 부여합니다.
   테이블 생성은 관리자 연결에서 수행합니다. 비밀번호를 저장소나 채팅에 공유하지 마세요.

## 2. GitHub
새 배포 파일을 검토한 뒤 studyroom 저장소에 커밋·푸시합니다.
RoomController/ 및 StudyroomApplication.java/ 연습 폴더는 배포에 필요하지 않습니다.

## 3. Render
New → Web Service → GitHub의 CJE-cpu/studyroom 연결.
- Runtime: Docker
- Branch: main
- Root Directory: 비워 둠
- Dockerfile Path: ./Dockerfile
- Docker Build Context: .
- Instance Type: Free
- Health Check Path: /api/health
- 자동 배포는 비용/빌드 횟수 관리를 위해 수동으로 설정해도 됩니다.
- 디스크나 별도 유료 데이터베이스를 추가하지 않습니다.

Environment:
| 이름 | 값 |
|---|---|
| SPRING_PROFILES_ACTIVE | prod |
| DB_URL | 아래 JDBC URL |
| DB_USERNAME | Aiven 앱 사용자 이름 |
| DB_PASSWORD | 해당 사용자의 비밀번호 |
| APP_ORIGIN | Render에서 부여한 https://서비스명.onrender.com (마지막 / 제외) |
| JAVA_TOOL_OPTIONS | -Xms64m -Xmx256m |

DB_URL (HOST/PORT를 Aiven 값으로 변경):
```text
jdbc:mysql://HOST:PORT/studyroom?sslMode=VERIFY_IDENTITY&connectionTimeZone=%2B09:00&forceConnectionTimeZoneToSession=true&connectTimeout=10000&socketTimeout=30000
```

Render의 Secret Files에 **aiven-ca.pem** 이름으로 다운로드한 CA 인증서 내용을 등록합니다.
컨테이너는 /etc/secrets/aiven-ca.pem을 Java 신뢰 저장소로 가져와 DB 서버 인증서를 검증합니다.
changeit은 인증서 신뢰 저장소의 암호이며 DB 비밀번호가 아닙니다.
DB 비밀번호와 CA 내용을 Docker 빌드 인자로 전달하지 않습니다.

서비스 생성 시 APP_ORIGIN 주소를 아직 모르면 생성 후 Render 주소를 확인하여 환경변수를 수정하고 다시 배포합니다.
APP_ORIGIN이 실제 접속 주소와 다르면 로그인/예약 요청은 403으로 거절됩니다.
커스텀 도메인을 추가하면 APP_ORIGIN도 그 주소로 변경합니다.

## 4. 배포 확인
1. /api/health → {"status":"UP"}
2. /api/rooms → 공간 두 개
3. /rooms/focus 직접 접근 및 새로고침 → 정상 화면
4. 새 계정 가입 → 로그인 → 헤더 이름 표시
5. 미래 시간 예약 → 내 예약 확인 → 취소
6. 로그아웃 후 내 예약 접근 시 로그인 안내
7. 다른 계정은 원래 계정의 예약을 조회·취소할 수 없는지 확인

서버 재시작/휴면 후에는 메모리 세션이 사라져 재로그인이 필요합니다. 회원·예약 데이터는 Aiven에 유지됩니다.
예약 시간은 한국 시간 기준입니다. 실제 운영용 공간 예약 서비스가 아닌 포트폴리오 시연용입니다.

## 문제 해결
- 빌드 실패: Render 로그에서 최초 오류를 확인합니다.
- 인증서 오류: Secret File 이름, CA 내용, Aiven 호스트 확인. TLS 검증을 끄지 않습니다.
- Access denied: DB 사용자/비밀번호/권한 확인.
- Schema-validation 오류: SQL 세 파일 실행 여부, DB_URL의 studyroom 확인.
- 로그인/예약 403: APP_ORIGIN과 브라우저 주소 일치 여부 확인.
- 로그인 상태 확인 오류: /api/health, DB 연결 및 서버 기동 로그 확인.
- 메모리 종료: Render 메모리 지표를 먼저 확인합니다. 힙 외에도 JVM 메모리가 사용됩니다.

## 비용과 제한
Render Free는 15분 미사용 후 휴면하고 첫 접속 시 기동 지연이 있습니다.
월 사용량 제한이 있으며 결제 수단이 있으면 트래픽/빌드 사용량 초과 비용이 발생할 수 있습니다.
Aiven은 Free 플랜인지 확인하고, 장기간 미사용에 따른 중지 안내 메일을 확인하세요.
무료 플랜을 상시 가용성이 필요한 실제 서비스 용도로 보장할 수는 없습니다.

공식 문서:
- https://render.com/docs/free
- https://render.com/docs/docker
- https://aiven.io/docs/products/mysql/concepts/mysql-free-tier
