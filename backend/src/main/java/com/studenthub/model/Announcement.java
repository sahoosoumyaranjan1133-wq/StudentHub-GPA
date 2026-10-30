package com.studenthub.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "announcements")
public class Announcement {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "announcement_id")
    private Long announcementId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "target_audience", nullable = false)
    private String targetAudience = "ALL";

    @Column(nullable = false)
    private boolean published = true;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public Long getAnnouncementId() { return announcementId; }
    public String getTitle() { return title; }
    public String getMessage() { return message; }
    public String getTargetAudience() { return targetAudience; }
    public boolean isPublished() { return published; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setAnnouncementId(Long announcementId) { this.announcementId = announcementId; }
    public void setTitle(String title) { this.title = title; }
    public void setMessage(String message) { this.message = message; }
    public void setTargetAudience(String targetAudience) { this.targetAudience = targetAudience; }
    public void setPublished(boolean published) { this.published = published; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
