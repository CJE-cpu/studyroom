package com.cje.studyroom;

import java.net.URI;
import java.net.http.*;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.cje.studyroom.member.repository.MemberRepository;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class SignupApiTests {
    @LocalServerPort int port;
    @Autowired MemberRepository members;
    @Autowired PasswordEncoder encoder;

    HttpResponse<String> post(String json) throws Exception {
        return HttpClient.newHttpClient().send(
            HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/auth/signup"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json)).build(),
            HttpResponse.BodyHandlers.ofString());
    }

    @Test void signupStoresHashAndRejectsDuplicate() throws Exception {
        String email = UUID.randomUUID() + "@example.com";
        String json = "{\"name\":\"Tester\",\"email\":\"" + email + "\",\"password\":\"TestPassword123!\"}";
        var response = post(json);
        assertEquals(201, response.statusCode(), response.body());
        var member = members.findByEmail(email).orElseThrow();
        assertTrue(encoder.matches("TestPassword123!", member.getPasswordHash()));
        assertNotEquals("TestPassword123!", member.getPasswordHash());
        assertFalse(response.body().contains("password"));
        assertFalse(response.body().contains(member.getPasswordHash()));
        var duplicate = post(json.replace(email, email.toUpperCase(java.util.Locale.ROOT)));
        assertEquals(409, duplicate.statusCode());
        assertTrue(duplicate.body().contains("message"));
    }

    @Test void invalidFieldsAreRejectedWithoutSaving() throws Exception {
        long count = members.count();
        var response = post("{\"name\":\" \",\"email\":\"invalid\",\"password\":\"short\"}");
        assertEquals(400, response.statusCode());
        assertTrue(response.body().contains("\"errors\""));
        assertFalse(response.body().contains("short"));
        assertEquals(count, members.count());
    }

    @Test void malformedJsonReturnsSafeError() throws Exception {
        var response = post("{");
        assertEquals(400, response.statusCode());
        assertTrue(response.body().contains("message"));
        assertFalse(response.body().contains("stackTrace"));
    }

    @Test void loginOnlySucceedsWithCorrectPassword() throws Exception {
        String email = UUID.randomUUID() + "@example.com";
        assertEquals(201, post("{\"name\":\"Login Tester\",\"email\":\"" + email
            + "\",\"password\":\"TestPassword123!\"}").statusCode());

        var client = HttpClient.newHttpClient();
        var endpoint = URI.create("http://localhost:" + port + "/api/auth/login");
        var invalid = client.send(HttpRequest.newBuilder(endpoint)
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString("{\"email\":\"" + email
                + "\",\"password\":\"WrongPassword123!\"}")).build(),
            HttpResponse.BodyHandlers.ofString());
        assertEquals(401, invalid.statusCode());
        assertTrue(invalid.headers().firstValue("set-cookie").isEmpty());

        var valid = client.send(HttpRequest.newBuilder(endpoint)
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString("{\"email\":\"" + email
                + "\",\"password\":\"TestPassword123!\"}")).build(),
            HttpResponse.BodyHandlers.ofString());
        assertEquals(200, valid.statusCode(), valid.body());
        assertTrue(valid.body().contains(email));
        assertFalse(valid.body().contains("password"));
        assertTrue(valid.headers().firstValue("set-cookie").orElse("").contains("JSESSIONID="));


        String cookie = valid.headers().firstValue("set-cookie").orElseThrow().split(";")[0];
        var meUri = URI.create("http://localhost:" + port + "/api/auth/me");
        var me = client.send(HttpRequest.newBuilder(meUri).header("Cookie", cookie).GET().build(),
            HttpResponse.BodyHandlers.ofString());
        assertEquals(200, me.statusCode());
        assertTrue(me.body().contains("Login Tester"));
        assertFalse(me.body().contains("password"));

        var logout = client.send(HttpRequest.newBuilder(
            URI.create("http://localhost:" + port + "/api/auth/logout"))
            .header("Cookie", cookie).POST(HttpRequest.BodyPublishers.noBody()).build(),
            HttpResponse.BodyHandlers.ofString());
        assertEquals(204, logout.statusCode());
        var afterLogout = client.send(HttpRequest.newBuilder(meUri).header("Cookie", cookie).GET().build(),
            HttpResponse.BodyHandlers.ofString());
        assertEquals(401, afterLogout.statusCode());
        var anonymous = client.send(HttpRequest.newBuilder(meUri).GET().build(),
            HttpResponse.BodyHandlers.ofString());
        assertEquals(401, anonymous.statusCode());

        var unknown = client.send(HttpRequest.newBuilder(endpoint)
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString("{\"email\":\"missing-" + email
                + "\",\"password\":\"TestPassword123!\"}")).build(),
            HttpResponse.BodyHandlers.ofString());
        assertEquals(401, unknown.statusCode());
        assertEquals(invalid.body(), unknown.body());
    }
}
