package com.studenthub.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.studenthub.model.Student;
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

    public StudentProfileController(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(Authentication authentication) {

        return studentRepository
                .findByEmailIgnoreCase(authentication.getName())
                .map(student -> ResponseEntity.ok(Map.of(
                    "studentId", student.getStudentId(),
                    "fullName", student.getFullName(),
                    "email", student.getEmail(),
                    "department", student.getDepartment() == null
                            ? "" : student.getDepartment(),
                    "semester", student.getSemester()
                )))
                .orElse(ResponseEntity.notFound().build());
    }
}
