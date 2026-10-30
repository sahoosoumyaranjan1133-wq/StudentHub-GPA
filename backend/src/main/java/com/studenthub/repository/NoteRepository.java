package com.studenthub.repository;

import com.studenthub.model.Note;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NoteRepository extends JpaRepository<Note, Long> {
    long countByReviewStatus(Note.ReviewStatus status);
}
