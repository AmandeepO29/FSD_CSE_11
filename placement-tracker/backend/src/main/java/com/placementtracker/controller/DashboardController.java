package com.placementtracker.controller;

import com.placementtracker.dto.response.AdminDashboardResponse;
import com.placementtracker.dto.response.PublicOverviewResponse;
import com.placementtracker.dto.response.StudentDashboardResponse;
import com.placementtracker.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/public/overview")
    public ResponseEntity<PublicOverviewResponse> getPublicOverview() {
        return ResponseEntity.ok(dashboardService.getPublicOverview());
    }

    @GetMapping("/dashboard/admin")
    public ResponseEntity<AdminDashboardResponse> getAdminDashboard() {
        return ResponseEntity.ok(dashboardService.getAdminDashboard());
    }

    @GetMapping("/dashboard/student")
    public ResponseEntity<StudentDashboardResponse> getStudentDashboard() {
        return ResponseEntity.ok(dashboardService.getStudentDashboard());
    }
}
