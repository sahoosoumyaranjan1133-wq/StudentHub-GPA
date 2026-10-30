package com.studenthub.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notes")
public class Note {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "note_id")
    private Long noteId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String subject;

    private Integer semester;

    @Column(name = "file_url", length = 1000)
    private String fileUrl;

    @Column(name = "uploaded_by")
    private Long uploadedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "review_status", nullable = false)
    private ReviewStatus reviewStatus = ReviewStatus.PENDING;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum ReviewStatus { PENDING, APPROVED, REJECTED }

    public Long getNoteId() { return noteId; }
    public String getTitle() { return title; }
    public String getSubject() { return subject; }
    public Integer getSemester() { return semester; }
    public String getFileUrl() { return fileUrl; }
    public Long getUploadedBy() { return uploadedBy; }
    public ReviewStatus getReviewStatus() { return reviewStatus; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setNoteId(Long noteId) { this.noteId = noteId; }
    public void setTitle(String title) { this.title = title; }
    public void setSubject(String subject) { this.subject = subject; }
    public void setSemester(Integer semester) { this.semester = semester; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    public void setUploadedBy(Long uploadedBy) { this.uploadedBy = uploadedBy; }
    public void setReviewStatus(ReviewStatus reviewStatus) { this.reviewStatus = reviewStatus; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
