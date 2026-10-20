package com.cje.studyroom.config;

import java.io.IOException;
import java.util.Set;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

// Same-origin browser clients only: reject cross-site session mutations, including login.
@Component
@Profile("prod")
public class ProductionOriginFilter extends OncePerRequestFilter {
    private static final Set<String> SAFE = Set.of("GET", "HEAD", "OPTIONS");
    private final String origin;

    public ProductionOriginFilter(@Value("${app.public-origin}") String origin) {
        if (!origin.matches("https://[^/]+")) {
            throw new IllegalArgumentException("APP_ORIGIN must be an HTTPS origin without a trailing slash");
        }
        this.origin = origin;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
            FilterChain chain) throws ServletException, IOException {
        if (request.getRequestURI().startsWith("/api/") && !SAFE.contains(request.getMethod())
                && !origin.equals(request.getHeader("Origin"))) {
            response.sendError(403);
            return;
        }
        chain.doFilter(request, response);
    }
}
