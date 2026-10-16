package com.cje.studyroom.reservation.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import com.cje.studyroom.reservation.entity.Reservation;
import com.cje.studyroom.reservation.entity.ReservationStatus;

public interface ReservationRepository
    extends JpaRepository<Reservation, Long> {

    @EntityGraph(attributePaths = "room")
    List<Reservation>
        findAllByMember_IdOrderByReservationDateDescStartHourDesc(
            Long memberId
        );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @EntityGraph(attributePaths = "room")
    Optional<Reservation> findByIdAndMember_Id(
        Long id,
        Long memberId
    );

    List<Reservation>
        findAllByRoom_IdAndReservationDateAndStatusOrderByStartHourAsc(
            String roomId,
            LocalDate reservationDate,
            ReservationStatus status
        );

    boolean existsByRoom_IdAndReservationDateAndStartHourAndStatus(
        String roomId,
        LocalDate reservationDate,
        int startHour,
        ReservationStatus status
    );
}