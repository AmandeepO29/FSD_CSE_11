package com.placementtracker.dto.request;

import com.placementtracker.entity.ApplicationStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ApplicationCreateRequest(
    @NotNull(message = "Placement drive ID is required")
    Long driveId
) {}
