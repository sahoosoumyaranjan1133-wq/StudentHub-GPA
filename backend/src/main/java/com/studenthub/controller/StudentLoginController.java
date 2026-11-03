// package com.studenthub.controller;

// import java.util.Map;

// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.security.authentication.AuthenticationManager;
// import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
// import org.springframework.security.core.AuthenticationException;
// import org.springframework.web.bind.annotation.CrossOrigin;
// import org.springframework.web.bind.annotation.PostMapping;
// import org.springframework.web.bind.annotation.RequestBody;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RestController;

// @RestController
// @RequestMapping("/api/students")
// @CrossOrigin(origins = {
//     "http://127.0.0.1:5500",
//     "http://localhost:5500"
// })
// public class StudentLoginController {

//     private final AuthenticationManager studentAuthenticationManager;

//     public StudentLoginController(
//             AuthenticationManager studentAuthenticationManager) {
//         this.studentAuthenticationManager = studentAuthenticationManager;
//     }

//     @PostMapping("/login")
//     public ResponseEntity<Map<String, String>> login(
//             @RequestBody LoginRequest request) {

//         if (request.email() == null || request.password() == null
//                 || request.email().isBlank() || request.password().isBlank()) {
//             return ResponseEntity.badRequest()
//                     .body(Map.of("message", "Email and password are required."));
//         }

//         try {
//             studentAuthenticationManager.authenticate(
//                     UsernamePasswordAuthenticationToken.unauthenticated(
//                             request.email().trim(),
//                             request.password()
//                     )
//             );

//             return ResponseEntity.ok(
//                     Map.of("message", "Login successful.")
//             );

//         } catch (AuthenticationException exception) {
//             return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
//                     .body(Map.of(
//                             "message",
//                             "Invalid credentials or account is awaiting approval."
//                     ));
//         }
//     }

//     public record LoginRequest(String email, String password) {}
// }
package com.studenthub.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = {
    "https://studenthub-gpa.pages.dev",
    "http://127.0.0.1:5500",
    "http://localhost:5500"
})
public class StudentLoginController {

    private final AuthenticationManager studentAuthenticationManager;

    public StudentLoginController(
        @Qualifier("studentAuthenticationManager")
        AuthenticationManager studentAuthenticationManager
    ) {
        this.studentAuthenticationManager = studentAuthenticationManager;
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
            studentAuthenticationManager.authenticate(
                UsernamePasswordAuthenticationToken.unauthenticated(
                    request.email().trim(),
                    request.password()
                )
            );

            return ResponseEntity.ok(
                Map.of("message", "Login successful.")
            );

        } catch (AuthenticationException exception) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message",
                    "Invalid credentials or account is awaiting approval."));
        }
    }

    public record LoginRequest(String email, String password) {}
}
