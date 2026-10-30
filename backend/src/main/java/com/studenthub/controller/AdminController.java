package com.studenthub.controller;

import com.studenthub.model.*;
import com.studenthub.service.AdminService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final AdminService service;

    public AdminController(AdminService service) { this.service = service; }

    @GetMapping("/dashboard")
    public Map<String, Long> dashboard() { return service.dashboard(); }

    @GetMapping("/students")
    public List<Student> students() { return service.allStudents(); }

    @PatchMapping("/students/{id}/status")
    public Student updateStudentStatus(@PathVariable Long id,
            @RequestBody StatusRequest request, Authentication auth) {
        try {
            return service.setStudentStatus(id, request.status(), auth.getName());
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage());
        }
    }

    @GetMapping("/notes")
    public List<Note> notes() { return service.allNotes(); }

    @PatchMapping("/notes/{id}/status")
    public Note updateNoteStatus(@PathVariable Long id,
            @RequestBody NoteStatusRequest request, Authentication auth) {
        try {
            return service.reviewNote(id, request.status(), auth.getName());
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage());
        }
    }

    @GetMapping("/announcements")
    public List<Announcement> announcements() { return service.allAnnouncements(); }

    @PostMapping("/announcements")
    public Announcement createAnnouncement(@RequestBody AnnouncementRequest request, Authentication auth) {
        Announcement a = new Announcement();
        a.setTitle(request.title());
        a.setMessage(request.message());
        a.setTargetAudience(request.targetAudience());
        try {
            return service.createAnnouncement(a, auth.getName());
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage());
        }
    }

    @GetMapping("/audit-logs")
    public List<AuditLog> auditLogs() { return service.allAuditLogs(); }

    public record StatusRequest(Student.AccountStatus status) {}
    public record NoteStatusRequest(Note.ReviewStatus status) {}
    public record AnnouncementRequest(String title, String message, String targetAudience) {}
}
