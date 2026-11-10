package com.studenthub.repository;

import java.util.Collection;
import java.util.List;

import com.studenthub.model.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    List<Announcement> findByPublishedTrueAndTargetAudienceInOrderByCreatedAtDesc(Collection<String> audiences);
}
