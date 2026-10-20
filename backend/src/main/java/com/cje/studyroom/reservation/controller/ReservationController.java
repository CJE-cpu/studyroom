package com.cje.studyroom.reservation.controller;

import java.util.List;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.cje.studyroom.reservation.dto.ReservationCreateRequest;
import com.cje.studyroom.reservation.dto.ReservationResponse;
import com.cje.studyroom.reservation.service.ReservationService;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(
        ReservationService reservationService
    ) {
        this.reservationService = reservationService;
    }

    @PostMapping
    public ResponseEntity<ReservationResponse> create(
        @Valid @RequestBody ReservationCreateRequest request,
        HttpServletRequest httpRequest
    ) {
        Long memberId = requireMemberId(httpRequest);

        ReservationResponse response =
            reservationService.create(memberId, request);

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .cacheControl(CacheControl.noStore())
            .body(response);
    }

    @GetMapping("/me")
    public ResponseEntity<List<ReservationResponse>> getMyReservations(
        HttpServletRequest request
    ) {
        Long memberId = requireMemberId(request);

        return ResponseEntity.ok()
            .cacheControl(CacheControl.noStore())
            .body(reservationService.getMyReservations(memberId));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ReservationResponse> cancel(
        @PathVariable("id") Long id,
        HttpServletRequest request
    ) {
        Long memberId = requireMemberId(request);

        return ResponseEntity.ok()
            .cacheControl(CacheControl.noStore())
            .body(reservationService.cancel(memberId, id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ReservationResponse> update(
        @PathVariable("id") Long id,
        @Valid @RequestBody ReservationCreateRequest body,
        HttpServletRequest request
    ) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
            .body(reservationService.update(requireMemberId(request), id, body));
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id, HttpServletRequest request) {
        reservationService.delete(requireMemberId(request), id);
        return ResponseEntity.noContent().cacheControl(CacheControl.noStore()).build();
    }

    private Long requireMemberId(HttpServletRequest request) {
        var session = request.getSession(false);

        if (session == null
            || !(session.getAttribute("memberId") instanceof Long memberId)) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "로그인이 필요합니다."
            );
        }

        return memberId;
    }
}