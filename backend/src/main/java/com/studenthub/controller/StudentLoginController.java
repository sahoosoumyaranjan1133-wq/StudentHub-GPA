package com.studenthub.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.studenthub.security.JwtService;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = {
    "https://studenthub-gpa.pages.dev",
    "http://127.0.0.1:5500",
    "http://localhost:5500"
})
public class StudentLoginController {

    private final AuthenticationManager studentAuthenticationManager;
    private final JwtService jwtService;

    public StudentLoginController(
        @Qualifier("studentAuthenticationManager")
        AuthenticationManager studentAuthenticationManager,
        JwtService jwtService
    ) {
        this.studentAuthenticationManager = studentAuthenticationManager;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(
            @RequestBody LoginRequest request) {

        if (request.email() == null || request.password() == null
                || request.email().isBlank()
                || request.password().isBlank()) {

            return ResponseEntity.badRequest()
                .body(Map.of("message",
                    "Email and password are required."));
        }

        try {
            Authentication authentication =
                studentAuthenticationManager.authenticate(
                    UsernamePasswordAuthenticationToken.unauthenticated(
                        request.email().trim(),
                        request.password()
                    )
                );

            UserDetails userDetails =
                (UserDetails) authentication.getPrincipal();

            String token = jwtService.generateToken(userDetails);

            return ResponseEntity.ok(
                Map.of(
                    "message", "Login successful.",
                    "token", token,
                    "tokenType", "Bearer"
                )
            );

        } catch (AuthenticationException exception) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message",
                    "Invalid credentials or account is awaiting approval."));
        }
    }

    public record LoginRequest(String email, String password) {}
}
