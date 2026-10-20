package com.cje.studyroom.config;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import java.util.concurrent.atomic.AtomicBoolean;
import static org.junit.jupiter.api.Assertions.*;

class ProductionOriginFilterTest {
    @Test void allowsSameOriginMutation() throws Exception {
        var request = new MockHttpServletRequest("POST", "/api/auth/login");
        request.addHeader("Origin", "https://studyroom.onrender.com");
        var reached = new AtomicBoolean();
        new ProductionOriginFilter("https://studyroom.onrender.com").doFilter(
            request, new MockHttpServletResponse(), (req, res) -> reached.set(true));
        assertTrue(reached.get());
    }

    @Test void rejectsForeignOrMissingOrigin() throws Exception {
        for (String origin : new String[] {"https://attacker.example", ""}) {
            var request = new MockHttpServletRequest("PATCH", "/api/reservations/1/cancel");
            if (!origin.isEmpty()) request.addHeader("Origin", origin);
            var response = new MockHttpServletResponse();
            new ProductionOriginFilter("https://studyroom.onrender.com").doFilter(
                request, response, (req, res) -> fail("Request should have been blocked"));
            assertEquals(403, response.getStatus());
        }
    }

    @Test void allowsReadWithoutOrigin() throws Exception {
        var reached = new AtomicBoolean();
        new ProductionOriginFilter("https://studyroom.onrender.com").doFilter(
            new MockHttpServletRequest("GET", "/api/health"), new MockHttpServletResponse(),
            (req, res) -> reached.set(true));
        assertTrue(reached.get());
    }
}
