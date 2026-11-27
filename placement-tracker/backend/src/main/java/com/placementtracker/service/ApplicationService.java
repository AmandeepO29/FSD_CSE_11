package com.placementtracker.service;

import com.placementtracker.dto.request.ApplicationCreateRequest;
import com.placementtracker.dto.request.ApplicationStatusUpdateRequest;
import com.placementtracker.dto.response.ApplicationResponse;
import com.placementtracker.dto.response.EligibilityResultResponse;
import com.placementtracker.entity.*;
import com.placementtracker.exception.BadRequestException;
import com.placementtracker.exception.DuplicateResourceException;
import com.placementtracker.exception.ResourceNotFoundException;
import com.placementtracker.mapper.EntityMapper;
import com.placementtracker.repository.*;
import com.placementtracker.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final ApplicationStatusHistoryRepository historyRepository;
    private final StudentRepository studentRepository;
    private final PlacementDriveRepository driveRepository;
    private final EligibilityService eligibilityService;
    private final EntityMapper mapper;

    public ApplicationService(
        ApplicationRepository applicationRepository,
        ApplicationStatusHistoryRepository historyRepository,
        StudentRepository studentRepository,
        PlacementDriveRepository driveRepository,
        EligibilityService eligibilityService,
        EntityMapper mapper
    ) {
        this.applicationRepository = applicationRepository;
        this.historyRepository = historyRepository;
        this.studentRepository = studentRepository;
        this.driveRepository = driveRepository;
        this.eligibilityService = eligibilityService;
        this.mapper = mapper;
    }

    @Transactional
    public ApplicationResponse applyForDrive(ApplicationCreateRequest request) {
        String email = SecurityUtils.getCurrentUserEmail();
        Student student = studentRepository.findByUserEmailIgnoreCase(email)
            .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        PlacementDrive drive = driveRepository.findById(request.driveId())
            .orElseThrow(() -> new ResourceNotFoundException("Placement drive not found with id: " + request.driveId()));

        if (applicationRepository.existsByStudentIdAndDriveId(student.getId(), drive.getId())) {
            throw new DuplicateResourceException("You have already applied to this placement drive");
        }

        EligibilityResultResponse eligibility = eligibilityService.evaluate(student, drive);
        if (!eligibility.eligible()) {
            throw new BadRequestException("You are not eligible for this drive: " + String.join("; ", eligibility.reasons()));
        }

        Application application = new Application();
        application.setStudent(student);
        application.setDrive(drive);
        application.setStatus(ApplicationStatus.APPLIED);
        application.setRemarks("Application submitted by student");
        Application saved = applicationRepository.save(application);

        ApplicationStatusHistory initialHistory = new ApplicationStatusHistory();
        initialHistory.setApplication(saved);
        initialHistory.setStatus(ApplicationStatus.APPLIED);
        initialHistory.setRemarks("Application submitted");
        initialHistory.setChangedBy(student.getFullName() + " (" + student.getEnrollmentNumber() + ")");
        historyRepository.save(initialHistory);

        List<ApplicationStatusHistory> history = historyRepository.findByApplicationIdOrderByChangedAtAsc(saved.getId());
        return mapper.toApplicationResponse(saved, history);
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> getMyApplications() {
        String email = SecurityUtils.getCurrentUserEmail();
        Student student = studentRepository.findByUserEmailIgnoreCase(email)
            .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
        return applicationRepository.findAllByStudentIdWithDetails(student.getId()).stream()
            .map(a -> mapper.toApplicationResponse(a, historyRepository.findByApplicationIdOrderByChangedAtAsc(a.getId())))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> searchApplications(
        Long companyId,
        Long driveId,
        String branch,
        ApplicationStatus status,
        String search
    ) {
        return applicationRepository.searchApplications(companyId, driveId, branch, status, search).stream()
            .map(a -> mapper.toApplicationResponse(a, historyRepository.findByApplicationIdOrderByChangedAtAsc(a.getId())))
            .toList();
    }

    @Transactional
    public ApplicationResponse updateApplicationStatus(Long applicationId, ApplicationStatusUpdateRequest request) {
        Application application = applicationRepository.findById(applicationId)
            .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + applicationId));

        String remarks = (request.remarks() != null && !request.remarks().isBlank())
            ? request.remarks().trim()
            : "Status updated to " + request.status().name();

        application.setStatus(request.status());
        application.setRemarks(remarks);
        Application saved = applicationRepository.save(application);

        ApplicationStatusHistory historyEntry = new ApplicationStatusHistory();
        historyEntry.setApplication(saved);
        historyEntry.setStatus(request.status());
        historyEntry.setRemarks(remarks);
        historyEntry.setChangedBy(SecurityUtils.getCurrentUserEmail());
        historyRepository.save(historyEntry);

        List<ApplicationStatusHistory> history = historyRepository.findByApplicationIdOrderByChangedAtAsc(saved.getId());
        return mapper.toApplicationResponse(saved, history);
    }
}
