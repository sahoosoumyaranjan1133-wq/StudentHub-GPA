package com.studenthub.security;

import com.studenthub.model.Student;
import com.studenthub.repository.StudentRepository;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class StudentUserDetailsService implements UserDetailsService {

    private final StudentRepository studentRepository;

    public StudentUserDetailsService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        Student student = studentRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("Invalid email or password."));

        if (student.getPasswordHash() == null
                || student.getAccountStatus() != Student.AccountStatus.ACTIVE) {
            throw new UsernameNotFoundException(
                    "Invalid email or password.");
        }

        return User.withUsername(student.getEmail())
                .password(student.getPasswordHash())
                .roles(student.getRole().name())
                .build();
    }
}
