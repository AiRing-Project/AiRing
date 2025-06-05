package com.airing.backend.callSummary.repository;

import com.airing.backend.callSummary.entity.CallSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CallSummaryRepository extends JpaRepository<CallSummary, Long> {

    Optional<CallSummary> findByCallLog_Id(Long callLogId);

}
