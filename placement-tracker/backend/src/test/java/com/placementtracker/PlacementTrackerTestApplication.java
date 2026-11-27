package com.placementtracker;

import org.springframework.boot.SpringApplication;

public class PlacementTrackerTestApplication {

    public static void main(String[] args) {
        SpringApplication.from(PlacementTrackerApplication::main)
            .withAdditionalProfiles("test")
            .run(args);
    }
}
