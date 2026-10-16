package com.cje.studyroom.reservation.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ReservationCreateRequest(

    @NotBlank(message = "공간을 선택해주세요.")
    @Size(max = 50, message = "공간 ID가 너무 깁니다.")
    String roomId,

    @NotNull(message = "예약 날짜를 선택해주세요.")
    LocalDate reservationDate,

    @NotNull(message = "시작 시간을 선택해주세요.")
    @Min(value = 9, message = "예약은 9시부터 가능합니다.")
    @Max(value = 21, message = "마지막 예약 시작 시간은 21시입니다.")
    Integer startHour,

    @NotNull(message = "이용 인원을 선택해주세요.")
    @Min(value = 1, message = "이용 인원은 1명 이상이어야 합니다.")
    Integer people

) {
}