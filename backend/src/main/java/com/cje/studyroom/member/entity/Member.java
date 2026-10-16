package com.cje.studyroom.member.entity;

import java.time.Instant;
import java.util.Locale;
import jakarta.persistence.*;

@Entity
@Table(name = "members", uniqueConstraints = @UniqueConstraint(name = "uk_members_email", columnNames = "email"))
public class Member {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 254)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(nullable = false, length = 40)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MemberRole role;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected Member() {}

    // Call only with an encoded password from the signup service.
    public Member(String email, String passwordHash, String name) {
        if (email == null || email.isBlank() || passwordHash == null || passwordHash.isBlank()
                || name == null || name.isBlank()) {
            throw new IllegalArgumentException("회원 필수 정보가 비어 있습니다.");
        }
        this.email = email.trim().toLowerCase(Locale.ROOT);
        this.passwordHash = passwordHash;
        this.name = name.trim();
        this.role = MemberRole.USER;
    }

    @PrePersist
    void initializeCreatedAt() { createdAt = Instant.now(); }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public String getName() { return name; }
    public MemberRole getRole() { return role; }
    public Instant getCreatedAt() { return createdAt; }
}
