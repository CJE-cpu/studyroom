package com.cje.studyroom.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SignupRequest(

    @NotBlank(message = "이름을 입력해주세요.")
    @Size(max = 40, message = "이름은 40자 이내로 입력해주세요.")
    String name,

    @NotBlank(message = "이메일을 입력해주세요.")
    @Email(message = "올바른 이메일 형식을 입력해주세요.")
    @Size(max = 254, message = "이메일은 254자 이내로 입력해주세요.")
    String email,

    @NotBlank(message = "비밀번호를 입력해주세요.")
    @Size(
        min = 8,
        max = 64,
        message = "비밀번호는 8자 이상 64자 이하로 입력해주세요."
    )
    String password

) {
    @Override
    public String toString() {
        return "SignupRequest[REDACTED]";
    }
}