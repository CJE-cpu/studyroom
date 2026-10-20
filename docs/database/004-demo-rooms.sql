-- Run against the deployed Aiven database after creating the schema.
-- Adds missing demo rooms only; preserves existing rooms and reservations.
SET NAMES utf8mb4;
USE studyroom;
START TRANSACTION;

INSERT INTO rooms (id, name, capacity, image, description)
SELECT 'focus', '포커스 스터디룸', 4, '/images/room-four-person.png',
       '2~4명이 함께 공부하거나 소규모 회의를 진행하기 위한 독립형 스터디룸입니다. 코딩 스터디, 자격증 공부, 면접 연습에 적합하며 화이트보드로 아이디어를 정리할 수 있습니다. 포트폴리오 시연용 가상 공간입니다.'
WHERE NOT EXISTS (SELECT 1 FROM rooms WHERE id = 'focus');

INSERT INTO rooms (id, name, capacity, image, description)
SELECT 'lounge', '그룹 스터디 라운지', 8, '/images/hero-studyroom.png',
       '최대 8명이 넓은 테이블에서 함께 작업하는 그룹 스터디 공간입니다. 팀 프로젝트, 독서 모임, 과제 토론에 적합하며 자연광이 들어오는 편안한 분위기로 구성했습니다. 예약은 좌석별이 아닌 공간 전체 기준이며, 포트폴리오 시연용 가상 공간입니다.'
WHERE NOT EXISTS (SELECT 1 FROM rooms WHERE id = 'lounge');

INSERT INTO room_amenities (room_id, sort_order, amenity)
SELECT seed.room_id, seed.sort_order, seed.amenity
FROM (
    SELECT 'focus' AS room_id, 0 AS sort_order, '화이트보드' AS amenity
    UNION ALL SELECT 'focus', 1, 'Wi-Fi'
    UNION ALL SELECT 'focus', 2, '콘센트'
    UNION ALL SELECT 'lounge', 0, '데스크 램프'
    UNION ALL SELECT 'lounge', 1, 'Wi-Fi'
    UNION ALL SELECT 'lounge', 2, '공용 테이블'
) AS seed
WHERE NOT EXISTS (
    SELECT 1 FROM room_amenities AS existing
    WHERE existing.room_id = seed.room_id AND existing.sort_order = seed.sort_order
);

COMMIT;
SELECT id, name, capacity, image FROM rooms ORDER BY id;
