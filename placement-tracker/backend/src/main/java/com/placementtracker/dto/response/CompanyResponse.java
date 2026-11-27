package com.placementtracker.dto.response;

import java.time.LocalDateTime;

public record CompanyResponse(
    Long id,
    String name,
    String industry,
    String website,
    String location,
    String description,
    String hrContactEmail,
    int totalDrives,
    int activeDrives,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
