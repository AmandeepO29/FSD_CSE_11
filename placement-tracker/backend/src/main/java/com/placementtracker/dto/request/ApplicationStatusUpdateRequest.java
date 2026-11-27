package com.placementtracker.dto.request;

import com.placementtracker.entity.ApplicationStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ApplicationStatusUpdateRequest(
    @NotNull(message = "Application status is required")
    ApplicationStatus status,

    @Size(max = 1000)
    String remarks
) {}
