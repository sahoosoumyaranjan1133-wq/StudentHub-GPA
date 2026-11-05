package com.studenthub.controller;

import com.studenthub.model.Student;
import com.studenthub.repository.StudentRepository;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    public StudentController(StudentRepository studentRepository, PasswordEncoder passwordEncoder) {
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> register(
            @RequestBody RegistrationRequest request) {

        // if (request.fullName() == null || request.fullName().isBlank()
        //         || request.email() == null || request.email().isBlank()) {
        //     throw new ResponseStatusException(
        //             HttpStatus.BAD_REQUEST,
        //             "Full name and email are required.");
        // }
        if (request.fullName() == null || request.fullName().isBlank()
        || request.email() == null || request.email().isBlank()
        || request.password() == null || request.password().length() < 8) {
    throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "Name, email, and a password of at least 8 characters are required.");
}

        String email = request.email().trim().toLowerCase();

        if (!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Enter a valid email address.");
        }

        if (studentRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "This email is already registered.");
        }

        Student student = new Student();
        student.setFullName(request.fullName().trim());
        student.setPasswordHash(passwordEncoder.encode(request.password()));
        student.setEmail(email);
        student.setDepartment(request.department());
        student.setSemester(request.semester());

        // Public registration cannot assign privileged roles.
        student.setRole(Student.Role.STUDENT);
        student.setAccountStatus(Student.AccountStatus.INACTIVE);

        Student saved = studentRepository.save(student);

        return Map.of(
                "message", "Registration successfully! You can now log in.",
                "studentId", saved.getStudentId(),
                "fullName", saved.getFullName(),
                "email", saved.getEmail(),
                "accountStatus", saved.getAccountStatus().name()
        );
    }

    public record RegistrationRequest(
            String fullName,
            String email,
            String department,
            Integer semester,
            String password) {
    }
}
