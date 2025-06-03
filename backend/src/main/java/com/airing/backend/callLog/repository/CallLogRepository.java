package com.airing.backend.callLog.repository;

import com.airing.backend.callLog.entity.CallLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface CallLogRepository extends JpaRepository<CallLog, Long> {

    Optional<CallLog> findTopByUserIdOrderByStartedAtDesc(Long userId);

    List<CallLog> findAllByUserIdAndStartedAtBetween(Long userId, OffsetDateTime start, OffsetDateTime end);
}
