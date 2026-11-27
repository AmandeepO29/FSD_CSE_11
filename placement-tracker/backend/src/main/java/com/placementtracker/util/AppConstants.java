package com.placementtracker.util;

import java.util.List;

public final class AppConstants {

    private AppConstants() {}

    public static final List<String> SUPPORTED_BRANCHES = List.of(
        "CSE",
        "CSE-AIML",
        "CSE-DS",
        "IT",
        "ECE",
        "EEE",
        "ME",
        "CE"
    );

    public static final long MAX_RESUME_SIZE_BYTES = 5L * 1024L * 1024L;
}
