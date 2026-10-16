package com.cje.studyroom;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.cje.studyroom.member.entity.Member;
import com.cje.studyroom.member.repository.MemberRepository;
import com.cje.studyroom.room.entity.Room;
import com.cje.studyroom.room.repository.RoomRepository;
import com.cje.studyroom.reservation.dto.ReservationCreateRequest;
import com.cje.studyroom.reservation.entity.ReservationStatus;
import com.cje.studyroom.reservation.service.ReservationService;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class ReservationServiceTests {
    @Autowired ReservationService service;
    @Autowired MemberRepository members;
    @Autowired RoomRepository rooms;

    private Member member() {
        return members.saveAndFlush(new Member(UUID.randomUUID() + "@example.com", "test-hash", "Tester"));
    }
    private Room room() {
        return rooms.saveAndFlush(new Room(UUID.randomUUID().toString(), "Test room", 4, "/test.png", "Test", List.of()));
    }
    private LocalDate tomorrow() {
        return LocalDate.now(ZoneId.of("Asia/Seoul")).plusDays(1);
    }
    private void rejects(int status, Runnable action) {
        var error = assertThrows(ResponseStatusException.class, action::run);
        assertEquals(status, error.getStatusCode().value());
    }

    @Test void reservationCanBeListedCancelledAndRebooked() {
        var member = member();
        var room = room();
        var request = new ReservationCreateRequest(room.getId(), tomorrow(), 14, 2);
        var created = service.create(member.getId(), request);
        assertEquals(ReservationStatus.CONFIRMED, created.status());
        assertEquals(1, service.getMyReservations(member.getId()).size());
        assertFalse(service.getAvailableHours(room.getId(), tomorrow()).contains(14));
        rejects(409, () -> service.create(member.getId(), request));
        assertEquals(ReservationStatus.CANCELLED, service.cancel(member.getId(), created.id()).status());
        assertTrue(service.getAvailableHours(room.getId(), tomorrow()).contains(14));
        rejects(409, () -> service.cancel(member.getId(), created.id()));
        assertNotEquals(created.id(), service.create(member.getId(), request).id());
    }

    @Test void otherMemberCannotReadOrCancelReservation() {
        var owner = member();
        var other = member();
        var room = room();
        var created = service.create(owner.getId(),
            new ReservationCreateRequest(room.getId(), tomorrow(), 14, 2));
        assertTrue(service.getMyReservations(other.getId()).isEmpty());
        rejects(404, () -> service.cancel(other.getId(), created.id()));
        rejects(401, () -> service.getMyReservations(null));
    }

    @Test void invalidDatesHoursAndCapacityAreRejected() {
        var member = member();
        var room = room();
        rejects(400, () -> service.create(member.getId(),
            new ReservationCreateRequest(room.getId(), tomorrow(), 14, 5)));
        rejects(400, () -> service.create(member.getId(),
            new ReservationCreateRequest(room.getId(), tomorrow(), 22, 2)));
        rejects(400, () -> service.create(member.getId(),
            new ReservationCreateRequest(room.getId(), tomorrow().minusDays(2), 14, 2)));
        rejects(400, () -> service.create(member.getId(),
            new ReservationCreateRequest(room.getId(), tomorrow().plusDays(30), 14, 2)));
    }
}
