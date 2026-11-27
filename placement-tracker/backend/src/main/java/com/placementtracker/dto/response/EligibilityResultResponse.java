package com.placementtracker.dto.response;

import java.util.List;

public record EligibilityResultResponse(
    boolean eligible,
    List<String> reasons
) {}
