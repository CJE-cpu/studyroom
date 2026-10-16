-- Run after 001-members.sql using MySQL Workbench.
-- Table creation is safe to repeat. Initial data INSERTs should run only once.
USE studyroom;

CREATE TABLE IF NOT EXISTS rooms (
    id VARCHAR(50) NOT NULL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    capacity INT NOT NULL,
    image VARCHAR(500) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    CONSTRAINT ck_rooms_capacity CHECK (capacity > 0)
);

CREATE TABLE IF NOT EXISTS room_amenities (
    room_id VARCHAR(50) NOT NULL,
    sort_order INT NOT NULL,
    amenity VARCHAR(100) NOT NULL,
    PRIMARY KEY (room_id, sort_order),
    CONSTRAINT fk_room_amenities_room FOREIGN KEY (room_id)
        REFERENCES rooms (id) ON DELETE CASCADE
);

START TRANSACTION;
INSERT INTO rooms (id, name, capacity, image, description) VALUES
('focus', '포커스 룸', 4, '/images/room-four-person.png', '팀 스터디와 작은 회의를 위한 공간입니다.'),
('lounge', '오픈 라운지', 8, '/images/hero-studyroom.png', '자연광과 넓은 테이블이 있는 열린 공간입니다.');

INSERT INTO room_amenities (room_id, sort_order, amenity) VALUES
('focus', 0, '화이트보드'),
('focus', 1, 'Wi-Fi'),
('focus', 2, '콘센트'),
('lounge', 0, '데스크 램프'),
('lounge', 1, 'Wi-Fi'),
('lounge', 2, '공용 테이블');
COMMIT;
