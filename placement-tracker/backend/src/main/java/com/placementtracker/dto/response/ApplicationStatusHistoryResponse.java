package com.placementtracker.dto.response;

import com.placementtracker.entity.ApplicationStatus;

import java.time.LocalDateTime;

public record ApplicationStatusHistoryResponse(
    Long id,
    ApplicationStatus status,
    String remarks,
    String changedBy,
    LocalDateTime changedAt
) {}
