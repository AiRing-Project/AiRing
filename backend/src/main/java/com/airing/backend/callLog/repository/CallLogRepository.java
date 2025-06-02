package com.airing.backend.callLog.repository;

import com.airing.backend.callLog.entity.CallLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CallLogRepository extends JpaRepository<CallLog, Long> {

}
