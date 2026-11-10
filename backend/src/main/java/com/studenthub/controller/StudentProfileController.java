package com.studenthub.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.studenthub.repository.StudentRepository;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = {
    "https://studenthub-gpa.pages.dev",
    "http://127.0.0.1:5500",
    "http://localhost:5500"
})
public class StudentProfileController {

    private final StudentRepository studentRepository;

    public StudentProfileController(
            StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(
            Authentication authentication) {

        // Authentication check
        if (authentication == null ||
            !authentication.isAuthenticated() ||
            authentication instanceof AnonymousAuthenticationToken) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Authentication required"));
        }

        // Find authenticated student
        return studentRepository
                .findByEmailIgnoreCase(authentication.getName())
                .map(student -> {

                    Map<String, Object> profile = Map.of(
                        "studentId",
                        student.getStudentId() == null
                                ? "" : student.getStudentId(),

                        "fullName",
                        student.getFullName() == null
                                ? "" : student.getFullName(),

                        "email",
                        student.getEmail() == null
                                ? "" : student.getEmail(),

                        "department",
                        student.getDepartment() == null
                                ? "" : student.getDepartment(),

                        "semester",
                        student.getSemester() == null
                                ? "" : student.getSemester()
                    );

                    return ResponseEntity.ok(profile);
                })
                .orElse(
                    ResponseEntity.notFound().build()
                );
    }
}
