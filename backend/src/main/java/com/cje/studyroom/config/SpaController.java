package com.cje.studyroom.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {
    @GetMapping({"/", "/rooms", "/rooms/{id}", "/reservations",
        "/reservations/{id}/complete", "/login", "/signup"})
    public String page() {
        return "forward:/index.html";
    }
}
