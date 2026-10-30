package com.studenthub.service;

import com.studenthub.model.*;
import com.studenthub.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class AdminService {
    private final StudentRepository students;
    private final NoteRepository notes;
    private final AnnouncementRepository announcements;
    private final AuditLogRepository auditLogs;

    public AdminService(StudentRepository students, NoteRepository notes,
                        AnnouncementRepository announcements, AuditLogRepository auditLogs) {
        this.students = students;
        this.notes = notes;
        this.announcements = announcements;
        this.auditLogs = auditLogs;
    }

    public Map<String, Long> dashboard() {
        return Map.of(
            "totalStudents", students.countByRole(Student.Role.STUDENT),
            "totalFaculty", students.countByRole(Student.Role.FACULTY),
            "activeUsers", students.countByAccountStatus(Student.AccountStatus.ACTIVE),
            "pendingNotes", notes.countByReviewStatus(Note.ReviewStatus.PENDING),
            "totalNotes", notes.count(),
            "totalAnnouncements", announcements.count()
        );
    }

    public List<Student> allStudents() { return students.findAll(); }
    public List<Note> allNotes() { return notes.findAll(); }
    public List<Announcement> allAnnouncements() { return announcements.findAll(); }
    public List<AuditLog> allAuditLogs() { return auditLogs.findAll(); }

    @Transactional
    public Student setStudentStatus(Long id, Student.AccountStatus status, String actor) {
        Student s = students.findById(id).orElseThrow(() -> new IllegalArgumentException("Student not found"));
        if (s.getRole() == Student.Role.ADMIN) {
            throw new IllegalArgumentException("Admin accounts cannot be changed through student management");
        }
        s.setAccountStatus(status);
        students.save(s);
        log(actor, "SET_ACCOUNT_STATUS", "STUDENT", id, status.name());
        return s;
    }

    @Transactional
    public Note reviewNote(Long id, Note.ReviewStatus status, String actor) {
        Note note = notes.findById(id).orElseThrow(() -> new IllegalArgumentException("Note not found"));
        note.setReviewStatus(status);
        notes.save(note);
        log(actor, "REVIEW_NOTE", "NOTE", id, status.name());
        return note;
    }

    @Transactional
    public Announcement createAnnouncement(Announcement announcement, String actor) {
        if (announcement.getTitle() == null || announcement.getTitle().isBlank()
                || announcement.getMessage() == null || announcement.getMessage().isBlank()) {
            throw new IllegalArgumentException("Title and message are required");
        }
        announcement.setAnnouncementId(null);
        announcement.setPublished(true);
        if (announcement.getTargetAudience() == null || announcement.getTargetAudience().isBlank()) {
            announcement.setTargetAudience("ALL");
        }
        Announcement saved = announcements.save(announcement);
        log(actor, "CREATE_ANNOUNCEMENT", "ANNOUNCEMENT", saved.getAnnouncementId(), saved.getTitle());
        return saved;
    }

    private void log(String actor, String action, String type, Long id, String details) {
        AuditLog entry = new AuditLog();
        entry.setActorEmail(actor);
        entry.setAction(action);
        entry.setTargetType(type);
        entry.setTargetId(id);
        entry.setDetails(details);
        auditLogs.save(entry);
    }
}
