package com.placementtracker.controller;

import com.placementtracker.dto.request.PlacementDriveRequest;
import com.placementtracker.dto.response.PlacementDriveResponse;
import com.placementtracker.entity.DriveStatus;
import com.placementtracker.entity.JobType;
import com.placementtracker.service.PlacementDriveService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/drives")
public class PlacementDriveController {

    private final PlacementDriveService driveService;

    public PlacementDriveController(PlacementDriveService driveService) {
        this.driveService = driveService;
    }

    @GetMapping
    public ResponseEntity<List<PlacementDriveResponse>> listDrives(
        @RequestParam(required = false) String search,
        @RequestParam(required = false) Long companyId,
        @RequestParam(required = false) JobType jobType,
        @RequestParam(required = false) DriveStatus status,
        @RequestParam(required = false) Double minPackage,
        @RequestParam(required = false) String branch,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate deadlineBefore,
        @RequestParam(required = false) Boolean eligibleOnly
    ) {
        return ResponseEntity.ok(driveService.searchDrives(
            search, companyId, jobType, status, minPackage, branch, deadlineBefore, eligibleOnly
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlacementDriveResponse> getDrive(@PathVariable Long id) {
        return ResponseEntity.ok(driveService.getDriveById(id));
    }

    @PostMapping
    public ResponseEntity<PlacementDriveResponse> createDrive(@Valid @RequestBody PlacementDriveRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(driveService.createDrive(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PlacementDriveResponse> updateDrive(
        @PathVariable Long id,
        @Valid @RequestBody PlacementDriveRequest request
    ) {
        return ResponseEntity.ok(driveService.updateDrive(id, request));
    }

    @PatchMapping("/{id}/publish")
    public ResponseEntity<PlacementDriveResponse> togglePublish(
        @PathVariable Long id,
        @RequestParam boolean published
    ) {
        return ResponseEntity.ok(driveService.togglePublish(id, published));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteDrive(@PathVariable Long id) {
        driveService.deleteDrive(id);
        return ResponseEntity.ok(Map.of("message", "Placement drive deleted successfully"));
    }
}
