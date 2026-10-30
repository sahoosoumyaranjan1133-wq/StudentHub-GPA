package com.studenthub.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "students")
public class Student {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "student_id")
    private Long studentId;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    private String department;
    private Integer semester;

    @Column(name = "password_hash", length = 255)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.STUDENT;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_status", nullable = false)
    private AccountStatus accountStatus = AccountStatus.ACTIVE;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum Role { STUDENT, FACULTY, ADMIN }
    public enum AccountStatus { ACTIVE, INACTIVE }

    public Long getStudentId() { return studentId; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public String getPasswordHash(){
        return passwordHash;
    }
    public String getDepartment() { return department; }
    public Integer getSemester() { return semester; }
    public Role getRole() { return role; }
    public AccountStatus getAccountStatus() { return accountStatus; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public void setEmail(String email) { this.email = email; }
    public void setPasswordHash(String passwordHash){
        this.passwordHash = passwordHash;
    }
    public void setDepartment(String department) { this.department = department; }
    public void setSemester(Integer semester) { this.semester = semester; }
    public void setRole(Role role) { this.role = role; }
    public void setAccountStatus(AccountStatus accountStatus) { this.accountStatus = accountStatus; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
