package com.airing.backend.callLog.repository;

import com.airing.backend.callLog.entity.CallLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CallLogRepository extends JpaRepository<CallLog, Long> {
    Optional<CallLog> findTopByUserIdOrderByStartedAtDesc(Long userId);
}
