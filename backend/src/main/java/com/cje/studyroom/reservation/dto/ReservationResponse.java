package com.cje.studyroom.reservation.dto;

import java.time.Instant;
import java.time.LocalDate;

import com.cje.studyroom.reservation.entity.Reservation;
import com.cje.studyroom.reservation.entity.ReservationStatus;

public record ReservationResponse(
    Long id,
    String roomId,
    String roomName,
    LocalDate reservationDate,
    int startHour,
    int endHour,
    int people,
    ReservationStatus status,
    Instant createdAt,
    Instant cancelledAt
) {

    public static ReservationResponse from(Reservation reservation) {
        return new ReservationResponse(
            reservation.getId(),
            reservation.getRoom().getId(),
            reservation.getRoom().getName(),
            reservation.getReservationDate(),
            reservation.getStartHour(),
            reservation.getEndHour(),
            reservation.getPeople(),
            reservation.getStatus(),
            reservation.getCreatedAt(),
            reservation.getCancelledAt()
        );
    }
}