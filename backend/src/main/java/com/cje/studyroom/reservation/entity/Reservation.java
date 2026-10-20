package com.cje.studyroom.reservation.entity;

import java.time.Instant;
import java.time.LocalDate;

import com.cje.studyroom.member.entity.Member;
import com.cje.studyroom.room.entity.Room;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "reservations")
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(name = "reservation_date", nullable = false)
    private LocalDate reservationDate;

    @Column(name = "start_hour", nullable = false)
    private int startHour;

    @Column(nullable = false)
    private int people;

    @Enumerated(EnumType.STRING)
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.VARCHAR)
    @Column(nullable = false, length = 20)
    private ReservationStatus status = ReservationStatus.CONFIRMED;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "cancelled_at")
    private Instant cancelledAt;

    protected Reservation() {
        // JPA 기본 생성자
    }

    public Reservation(
        Member member,
        Room room,
        LocalDate reservationDate,
        int startHour,
        int people
    ) {
        if (member == null || room == null) {
            throw new IllegalArgumentException(
                "회원과 공간 정보가 필요합니다."
            );
        }

        if (reservationDate == null) {
            throw new IllegalArgumentException(
                "예약 날짜가 필요합니다."
            );
        }

        if (startHour < 9 || startHour > 21) {
            throw new IllegalArgumentException(
                "예약 시작 시간은 9시부터 21시까지입니다."
            );
        }

        if (people < 1 || people > room.getCapacity()) {
            throw new IllegalArgumentException(
                "이용 인원이 공간 정원을 벗어났습니다."
            );
        }

        this.member = member;
        this.room = room;
        this.reservationDate = reservationDate;
        this.startHour = startHour;
        this.people = people;
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public void reschedule(LocalDate date, int hour, int people) {
        if (status != ReservationStatus.CONFIRMED || date == null || hour < 9 || hour > 21
                || people < 1 || people > room.getCapacity()) {
            throw new IllegalArgumentException("유효하지 않은 예약 변경입니다.");
        }
        this.reservationDate = date;
        this.startHour = hour;
        this.people = people;
    }

    public void cancel() {
        if (status == ReservationStatus.CANCELLED) {
            throw new IllegalStateException(
                "이미 취소된 예약입니다."
            );
        }

        this.status = ReservationStatus.CANCELLED;
        this.cancelledAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public Member getMember() {
        return member;
    }

    public Room getRoom() {
        return room;
    }

    public LocalDate getReservationDate() {
        return reservationDate;
    }

    public int getStartHour() {
        return startHour;
    }

    public int getEndHour() {
        return startHour + 1;
    }

    public int getPeople() {
        return people;
    }

    public ReservationStatus getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getCancelledAt() {
        return cancelledAt;
    }
}