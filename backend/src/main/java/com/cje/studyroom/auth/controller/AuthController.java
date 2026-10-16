package com.cje.studyroom.auth.controller;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.server.ResponseStatusException;
import jakarta.servlet.http.HttpServletRequest;
import com.cje.studyroom.auth.dto.LoginRequest;
import com.cje.studyroom.auth.dto.LoginResponse;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cje.studyroom.auth.dto.SignupRequest;
import com.cje.studyroom.auth.dto.SignupResponse;
import com.cje.studyroom.auth.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<SignupResponse> signup(
        @Valid @RequestBody SignupRequest request
    ) {
        SignupResponse response = authService.signup(request);

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(response);
    }

    @PostMapping("/login")
    public LoginResponse login(
        @Valid @RequestBody LoginRequest request,
        HttpServletRequest httpRequest
    ) {
        LoginResponse response = authService.login(request);
        // Start a fresh session after authentication to prevent session fixation.
        var previousSession = httpRequest.getSession(false);
        if (previousSession != null) previousSession.invalidate();
        var session = httpRequest.getSession(true);
        session.setAttribute("memberId", response.id());
        session.setMaxInactiveInterval(1800);
        return response;
    }

    @GetMapping("/me")
    public LoginResponse me(HttpServletRequest request, jakarta.servlet.http.HttpServletResponse response) {
        response.setHeader("Cache-Control", "no-store");
        var session = request.getSession(false);
        if (session == null || !(session.getAttribute("memberId") instanceof Long id)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }
        return authService.currentMember(id);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        var session = request.getSession(false);
        if (session != null) session.invalidate();
        return ResponseEntity.noContent().build();
    }
}