-- Run once after 001-members.sql and 002-rooms.sql.
USE studyroom;
CREATE TABLE reservations (
 id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
 member_id BIGINT NOT NULL,
 room_id VARCHAR(50) NOT NULL,
 reservation_date DATE NOT NULL,
 start_hour INT NOT NULL,
 people INT NOT NULL,
 status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',
 created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
 cancelled_at TIMESTAMP(6) NULL DEFAULT NULL,
 active_slot INT GENERATED ALWAYS AS (
   CASE WHEN status = 'CONFIRMED' THEN start_hour ELSE NULL END
 ) STORED,
 CONSTRAINT fk_reservations_member FOREIGN KEY (member_id) REFERENCES members(id),
 CONSTRAINT fk_reservations_room FOREIGN KEY (room_id) REFERENCES rooms(id),
 CONSTRAINT uk_reservations_active_slot UNIQUE (room_id, reservation_date, active_slot),
 CONSTRAINT ck_reservations_start_hour CHECK (start_hour BETWEEN 9 AND 21),
 CONSTRAINT ck_reservations_people CHECK (people > 0),
 CONSTRAINT ck_reservations_status CHECK (status IN ('CONFIRMED', 'CANCELLED')),
 CONSTRAINT ck_reservations_cancelled_at CHECK (
   (status = 'CONFIRMED' AND cancelled_at IS NULL)
   OR (status = 'CANCELLED' AND cancelled_at IS NOT NULL)
 ),
 INDEX idx_reservations_member_date (member_id, reservation_date, start_hour)
);
