package com.cje.studyroom.common.exception;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    public record ErrorResponse(
        String message,
        Map<String, String> errors
    ) {
    }

    // 이름, 이메일, 비밀번호 등의 입력값 검증 실패
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(
        MethodArgumentNotValidException exception
    ) {
        Map<String, String> errors = new LinkedHashMap<>();

        exception.getBindingResult().getFieldErrors().forEach(error -> {
            errors.putIfAbsent(
                error.getField(),
                error.getDefaultMessage() != null
                    ? error.getDefaultMessage()
                    : "입력값을 확인해주세요."
            );
        });

        return ResponseEntity.badRequest().body(
            new ErrorResponse("입력 정보를 확인해주세요.", errors)
        );
    }

    // AuthService에서 발생시킨 이메일 중복 등의 오류
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleResponseStatus(
        ResponseStatusException exception
    ) {
        String message = exception.getReason() != null
            ? exception.getReason()
            : "요청을 처리할 수 없습니다.";

        return ResponseEntity
            .status(exception.getStatusCode())
            .body(new ErrorResponse(message, Map.of()));
    }

    // 동시에 가입 요청이 들어오는 경우를 포함한 DB 제약조건 위반
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrity(
        DataIntegrityViolationException exception
    ) {
        String message =
            "저장할 정보가 기존 데이터 또는 저장 규칙과 충돌합니다.";

        Throwable cause = exception;

        while (cause != null) {
            if (cause instanceof
                org.hibernate.exception.ConstraintViolationException violation) {

                String constraint = violation.getConstraintName();

                if (constraint != null) {
                    String normalized =
                        constraint.toLowerCase(java.util.Locale.ROOT);

                    if (normalized.equals("uk_members_email")
                        || normalized.endsWith(".uk_members_email")) {
                        message = "이미 사용 중인 이메일입니다.";
                        break;
                    }

                    if (normalized.equals("uk_reservations_active_slot")
                        || normalized.endsWith(".uk_reservations_active_slot")) {
                        message =
                            "이미 예약된 시간입니다. 다른 시간을 선택해주세요.";
                        break;
                    }
                }
            }

            cause = cause.getCause();
        }

        return ResponseEntity
            .status(HttpStatus.CONFLICT)
            .body(new ErrorResponse(message, Map.of()));
    }

    // 요청 본문이 없거나 JSON 형식이 잘못된 경우
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleInvalidJson(
        HttpMessageNotReadableException exception
    ) {
        return ResponseEntity.badRequest().body(
            new ErrorResponse("올바른 JSON 형식으로 요청해주세요.", Map.of())
        );
    }
}