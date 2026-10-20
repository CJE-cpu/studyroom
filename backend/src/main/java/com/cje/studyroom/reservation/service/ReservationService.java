package com.cje.studyroom.reservation.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.cje.studyroom.member.entity.Member;
import com.cje.studyroom.member.repository.MemberRepository;
import com.cje.studyroom.reservation.dto.ReservationCreateRequest;
import com.cje.studyroom.reservation.dto.ReservationResponse;
import com.cje.studyroom.reservation.entity.Reservation;
import com.cje.studyroom.reservation.entity.ReservationStatus;
import com.cje.studyroom.reservation.repository.ReservationRepository;
import com.cje.studyroom.room.entity.Room;
import com.cje.studyroom.room.repository.RoomRepository;

@Service
@Transactional(readOnly = true)
public class ReservationService {

    private static final ZoneId KOREA = ZoneId.of("Asia/Seoul");

    private final ReservationRepository reservationRepository;
    private final MemberRepository memberRepository;
    private final RoomRepository roomRepository;

    public ReservationService(
        ReservationRepository reservationRepository,
        MemberRepository memberRepository,
        RoomRepository roomRepository
    ) {
        this.reservationRepository = reservationRepository;
        this.memberRepository = memberRepository;
        this.roomRepository = roomRepository;
    }

    // 예약 생성
    @Transactional
    public ReservationResponse create(
        Long memberId,
        ReservationCreateRequest request
    ) {
        Member member = requireMember(memberId);

        Room room = roomRepository.findById(request.roomId())
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "공간을 찾을 수 없습니다."
            ));

        LocalDateTime now = LocalDateTime.now(KOREA);

        validateDate(request.reservationDate(), now.toLocalDate());

        if (request.startHour() == null
            || request.startHour() < 9
            || request.startHour() > 21) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "예약 시작 시간은 9시부터 21시까지입니다."
            );
        }

        LocalDateTime startAt = request.reservationDate()
            .atTime(request.startHour(), 0);

        if (!startAt.isAfter(now)) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "이미 시작한 시간은 예약할 수 없습니다."
            );
        }

        if (request.people() == null
            || request.people() < 1
            || request.people() > room.getCapacity()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "이용 인원은 1명부터 공간 정원까지 선택할 수 있습니다."
            );
        }

        boolean alreadyReserved = reservationRepository
            .existsByRoom_IdAndReservationDateAndStartHourAndStatus(
                room.getId(),
                request.reservationDate(),
                request.startHour(),
                ReservationStatus.CONFIRMED
            );

        if (alreadyReserved) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "이미 예약된 시간입니다."
            );
        }

        Reservation reservation = new Reservation(
            member,
            room,
            request.reservationDate(),
            request.startHour(),
            request.people()
        );

        // 동시에 들어온 중복 예약은 DB의 고유 제약으로 차단합니다.
        Reservation saved =
            reservationRepository.saveAndFlush(reservation);

        return ReservationResponse.from(saved);
    }

    @Transactional
    public ReservationResponse update(Long memberId, Long id, ReservationCreateRequest request) {
        requireMember(memberId);
        Reservation reservation = owned(memberId, id);
        if (reservation.getStatus() != ReservationStatus.CONFIRMED
                || !reservation.getReservationDate().atTime(reservation.getStartHour(), 0)
                    .isAfter(LocalDateTime.now(KOREA))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "시작 전의 유효한 예약만 수정할 수 있습니다.");
        }
        if (!reservation.getRoom().getId().equals(request.roomId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "공간 변경은 취소 후 새로 예약해주세요.");
        }
        LocalDateTime now = LocalDateTime.now(KOREA);
        validateDate(request.reservationDate(), now.toLocalDate());
        if (request.startHour() == null || request.startHour() < 9 || request.startHour() > 21
                || !request.reservationDate().atTime(request.startHour(), 0).isAfter(now)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "예약 가능한 미래 시간을 선택해주세요.");
        }
        if (request.people() == null || request.people() < 1
                || request.people() > reservation.getRoom().getCapacity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "공간 정원에 맞는 인원을 선택해주세요.");
        }
        boolean sameSlot = reservation.getReservationDate().equals(request.reservationDate())
            && reservation.getStartHour() == request.startHour();
        if (!sameSlot && reservationRepository.existsByRoom_IdAndReservationDateAndStartHourAndStatus(
                request.roomId(), request.reservationDate(), request.startHour(), ReservationStatus.CONFIRMED)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 예약된 시간입니다.");
        }
        reservation.reschedule(request.reservationDate(), request.startHour(), request.people());
        // The existing MySQL unique constraint also protects concurrent rescheduling.
        reservationRepository.flush();
        return ReservationResponse.from(reservation);
    }

    @Transactional
    public void delete(Long memberId, Long id) {
        requireMember(memberId);
        Reservation reservation = owned(memberId, id);
        if (reservation.getStatus() != ReservationStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "예약을 먼저 취소한 후 내역을 삭제해주세요.");
        }
        reservationRepository.delete(reservation);
        reservationRepository.flush();
    }

    private Reservation owned(Long memberId, Long id) {
        return reservationRepository.findByIdAndMember_Id(id, memberId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "예약을 찾을 수 없습니다."));
    }

    // 본인 예약 목록
    public List<ReservationResponse> getMyReservations(Long memberId) {
        requireMember(memberId);

        return reservationRepository
            .findAllByMember_IdOrderByReservationDateDescStartHourDesc(
                memberId
            )
            .stream()
            .map(ReservationResponse::from)
            .toList();
    }

    // 본인 예약 취소
    @Transactional
    public ReservationResponse cancel(
        Long memberId,
        Long reservationId
    ) {
        requireMember(memberId);

        Reservation reservation = reservationRepository
            .findByIdAndMember_Id(reservationId, memberId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "취소할 예약을 찾을 수 없습니다."
            ));

        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "이미 취소된 예약입니다."
            );
        }

        LocalDateTime startAt = reservation.getReservationDate()
            .atTime(reservation.getStartHour(), 0);

        if (!startAt.isAfter(LocalDateTime.now(KOREA))) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "이용이 시작된 예약은 취소할 수 없습니다."
            );
        }

        reservation.cancel();
        reservationRepository.flush();

        return ReservationResponse.from(reservation);
    }

    // 해당 공간·날짜의 예약 가능한 시작 시간
    public List<Integer> getAvailableHours(
        String roomId,
        LocalDate date
    ) {
        LocalDateTime now = LocalDateTime.now(KOREA);

        validateDate(date, now.toLocalDate());

        if (!roomRepository.existsById(roomId)) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "공간을 찾을 수 없습니다."
            );
        }

        Set<Integer> reservedHours = reservationRepository
            .findAllByRoom_IdAndReservationDateAndStatusOrderByStartHourAsc(
                roomId,
                date,
                ReservationStatus.CONFIRMED
            )
            .stream()
            .map(Reservation::getStartHour)
            .collect(Collectors.toSet());

        return IntStream.rangeClosed(9, 21)
            .filter(hour -> !reservedHours.contains(hour))
            .filter(hour -> date.atTime(hour, 0).isAfter(now))
            .boxed()
            .toList();
    }

    private Member requireMember(Long memberId) {
        if (memberId == null) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "로그인이 필요합니다."
            );
        }

        return memberRepository.findById(memberId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "회원 정보를 확인할 수 없습니다. 다시 로그인해주세요."
            ));
    }

    private void validateDate(LocalDate date, LocalDate today) {
        if (date == null
            || date.isBefore(today)
            || date.isAfter(today.plusDays(30))) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "예약 날짜는 오늘부터 30일 뒤까지 선택할 수 있습니다."
            );
        }
    }
}