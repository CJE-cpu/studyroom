package com.cje.studyroom.auth.dto;

public record SignupResponse(
    Long id,
    String name,
    String email
) {
}