package com.cje.studyroom.reservation.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cje.studyroom.reservation.service.ReservationService;

@RestController
@RequestMapping("/api/rooms")
public class RoomAvailabilityController {

    private final ReservationService reservationService;

    public RoomAvailabilityController(
        ReservationService reservationService
    ) {
        this.reservationService = reservationService;
    }

    @GetMapping("/{roomId}/availability")
    public ResponseEntity<List<Integer>> getAvailableHours(
        @PathVariable("roomId") String roomId,

        @RequestParam("date")
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        LocalDate date
    ) {
        return ResponseEntity.ok()
            .cacheControl(CacheControl.noStore())
            .body(reservationService.getAvailableHours(roomId, date));
    }
}