package com.cje.studyroom;

import com.cje.studyroom.member.entity.Member;
import com.cje.studyroom.member.entity.MemberRole;
import com.cje.studyroom.member.repository.MemberRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.annotation.Transactional;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class MemberRepositoryTests {
    @Autowired MemberRepository repository;

    @Test
    void persistsNormalizedMemberWithSafeDefaultRole() {
        Member member = repository.saveAndFlush(new Member(" PERSON@EXAMPLE.COM ", "test-encoded-value", " 이름 "));
        assertNotNull(member.getId());
        assertNotNull(member.getCreatedAt());
        assertEquals("person@example.com", member.getEmail());
        assertEquals("이름", member.getName());
        assertEquals(MemberRole.USER, member.getRole());
        assertTrue(repository.existsByEmail("person@example.com"));
    }

    @Test
    void databaseRejectsDuplicateEmail() {
        repository.saveAndFlush(new Member("same@example.com", "test-encoded-value", "첫째"));
        assertThrows(DataIntegrityViolationException.class, () ->
            repository.saveAndFlush(new Member(" SAME@example.com ", "test-encoded-value", "둘째")));
    }
}
