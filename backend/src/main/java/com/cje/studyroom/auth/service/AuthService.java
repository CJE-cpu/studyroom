package com.cje.studyroom.auth.service;

import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.cje.studyroom.auth.dto.SignupRequest;
import com.cje.studyroom.auth.dto.LoginRequest;
import com.cje.studyroom.auth.dto.LoginResponse;
import com.cje.studyroom.auth.dto.SignupResponse;
import com.cje.studyroom.member.entity.Member;
import com.cje.studyroom.member.repository.MemberRepository;

@Service
public class AuthService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
        MemberRepository memberRepository,
        PasswordEncoder passwordEncoder
    ) {
        this.memberRepository = memberRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public SignupResponse signup(SignupRequest request) {

        // 이메일 앞뒤 공백 제거 및 소문자 변환
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        String name = request.name().trim();

        // 이미 가입된 이메일인지 확인
        if (memberRepository.existsByEmail(email)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "이미 사용 중인 이메일입니다."
            );
        }

        // 비밀번호는 원문 대신 해시로 저장
        String passwordHash = passwordEncoder.encode(request.password());

        // Member 생성자 순서: 이메일, 비밀번호 해시, 이름
        Member member = new Member(email, passwordHash, name);
        Member savedMember = memberRepository.saveAndFlush(member);

        // 비밀번호를 제외한 가입 결과 반환
        return new SignupResponse(
            savedMember.getId(),
            savedMember.getName(),
            savedMember.getEmail()
        );
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        Member member = memberRepository.findByEmail(email).orElse(null);
        if (member == null || !passwordEncoder.matches(request.password(), member.getPasswordHash())) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED, "이메일 또는 비밀번호가 올바르지 않습니다."
            );
        }
        return new LoginResponse(member.getId(), member.getName(), member.getEmail());
    }

    @Transactional(readOnly = true)
    public LoginResponse currentMember(Long id) {
        Member member = memberRepository.findById(id).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다."));
        return new LoginResponse(member.getId(), member.getName(), member.getEmail());
    }
}