package com.placementtracker.dto.response;

import com.placementtracker.entity.Role;

public record AuthResponse(
    String token,
    String tokenType,
    Long userId,
    String username,
    String email,
    Role role,
    String fullName,
    Long studentId
) {}
