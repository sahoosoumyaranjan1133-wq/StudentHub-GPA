package com.studenthub.repository;

import java.util.Optional;

import com.studenthub.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentRepository extends JpaRepository<Student, Long> {

    long countByRole(Student.Role role);

    long countByAccountStatus(Student.AccountStatus status);

    boolean existsByEmailIgnoreCase(String email);

    Optional<Student> findByEmailIgnoreCase(String email);
}
