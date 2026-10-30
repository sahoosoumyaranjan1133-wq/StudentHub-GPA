package com.studenthub.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
public class AuditLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "audit_id")
    private Long auditId;

    @Column(name = "actor_email", nullable = false)
    private String actorEmail;

    @Column(nullable = false)
    private String action;

    @Column(name = "target_type", nullable = false)
    private String targetType;

    @Column(name = "target_id")
    private Long targetId;

    private String details;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public Long getAuditId() { return auditId; }
    public String getActorEmail() { return actorEmail; }
    public String getAction() { return action; }
    public String getTargetType() { return targetType; }
    public Long getTargetId() { return targetId; }
    public String getDetails() { return details; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setAuditId(Long auditId) { this.auditId = auditId; }
    public void setActorEmail(String actorEmail) { this.actorEmail = actorEmail; }
    public void setAction(String action) { this.action = action; }
    public void setTargetType(String targetType) { this.targetType = targetType; }
    public void setTargetId(Long targetId) { this.targetId = targetId; }
    public void setDetails(String details) { this.details = details; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
