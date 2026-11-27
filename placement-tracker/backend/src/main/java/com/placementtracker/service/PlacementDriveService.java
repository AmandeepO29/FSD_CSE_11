package com.placementtracker.service;

import com.placementtracker.dto.request.PlacementDriveRequest;
import com.placementtracker.dto.response.EligibilityResultResponse;
import com.placementtracker.dto.response.PlacementDriveResponse;
import com.placementtracker.entity.*;
import com.placementtracker.exception.BadRequestException;
import com.placementtracker.exception.ResourceNotFoundException;
import com.placementtracker.mapper.EntityMapper;
import com.placementtracker.repository.ApplicationRepository;
import com.placementtracker.repository.CompanyRepository;
import com.placementtracker.repository.PlacementDriveRepository;
import com.placementtracker.repository.StudentRepository;
import com.placementtracker.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class PlacementDriveService {

    private final PlacementDriveRepository driveRepository;
    private final CompanyRepository companyRepository;
    private final StudentRepository studentRepository;
    private final ApplicationRepository applicationRepository;
    private final EligibilityService eligibilityService;
    private final EntityMapper mapper;

    public PlacementDriveService(
        PlacementDriveRepository driveRepository,
        CompanyRepository companyRepository,
        StudentRepository studentRepository,
        ApplicationRepository applicationRepository,
        EligibilityService eligibilityService,
        EntityMapper mapper
    ) {
        this.driveRepository = driveRepository;
        this.companyRepository = companyRepository;
        this.studentRepository = studentRepository;
        this.applicationRepository = applicationRepository;
        this.eligibilityService = eligibilityService;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<PlacementDriveResponse> searchDrives(
        String search,
        Long companyId,
        JobType jobType,
        DriveStatus status,
        Double minPackage,
        String branch,
        LocalDate deadlineBefore,
        Boolean eligibleOnly
    ) {
        boolean isAdmin = SecurityUtils.hasRole("ADMIN");
        Student currentStudent = null;
        if (!isAdmin && SecurityUtils.hasRole("STUDENT")) {
            currentStudent = studentRepository.findByUserEmailIgnoreCase(SecurityUtils.getCurrentUserEmail())
                .orElse(null);
        }

        List<PlacementDrive> drives = driveRepository.searchDrives(
            !isAdmin,
            search,
            companyId,
            jobType,
            status,
            minPackage,
            deadlineBefore
        );

        final Student studentRef = currentStudent;
        Set<Long> appliedDriveIds = studentRef != null
            ? applicationRepository.findAllByStudentIdWithDetails(studentRef.getId()).stream()
                .map(a -> a.getDrive().getId())
                .collect(Collectors.toSet())
            : Set.of();

        return drives.stream()
            .filter(d -> branch == null || branch.isBlank() || matchesBranchFilter(d.getEligibleBranches(), branch))
            .map(d -> {
                EligibilityResultResponse eligibility = studentRef != null ? eligibilityService.evaluate(studentRef, d) : null;
                boolean applied = appliedDriveIds.contains(d.getId());
                long count = applicationRepository.countByDriveId(d.getId());
                return mapper.toDriveResponse(d, count, eligibility, applied);
            })
            .filter(resp -> !Boolean.TRUE.equals(eligibleOnly) || (resp.eligibility() != null && resp.eligibility().eligible()))
            .toList();
    }

    @Transactional(readOnly = true)
    public PlacementDriveResponse getDriveById(Long id) {
        PlacementDrive drive = driveRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Placement drive not found with id: " + id));
        if (!SecurityUtils.hasRole("ADMIN") && !drive.isPublished()) {
            throw new ResourceNotFoundException("Placement drive not found");
        }

        EligibilityResultResponse eligibility = null;
        boolean alreadyApplied = false;
        if (SecurityUtils.hasRole("STUDENT")) {
            Student student = studentRepository.findByUserEmailIgnoreCase(SecurityUtils.getCurrentUserEmail())
                .orElse(null);
            if (student != null) {
                eligibility = eligibilityService.evaluate(student, drive);
                alreadyApplied = applicationRepository.existsByStudentIdAndDriveId(student.getId(), drive.getId());
            }
        }
        return mapper.toDriveResponse(drive, applicationRepository.countByDriveId(drive.getId()), eligibility, alreadyApplied);
    }

    @Transactional
    public PlacementDriveResponse createDrive(PlacementDriveRequest request) {
        validateDates(request);
        Company company = companyRepository.findById(request.companyId())
            .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + request.companyId()));

        PlacementDrive drive = new PlacementDrive();
        applyFields(drive, company, request);
        PlacementDrive saved = driveRepository.save(drive);
        return mapper.toDriveResponse(saved, 0L, null, false);
    }

    @Transactional
    public PlacementDriveResponse updateDrive(Long id, PlacementDriveRequest request) {
        validateDates(request);
        PlacementDrive drive = driveRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Placement drive not found with id: " + id));
        Company company = companyRepository.findById(request.companyId())
            .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + request.companyId()));

        applyFields(drive, company, request);
        PlacementDrive saved = driveRepository.save(drive);
        return mapper.toDriveResponse(saved, applicationRepository.countByDriveId(saved.getId()), null, false);
    }

    @Transactional
    public PlacementDriveResponse togglePublish(Long id, boolean published) {
        PlacementDrive drive = driveRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Placement drive not found with id: " + id));
        drive.setPublished(published);
        PlacementDrive saved = driveRepository.save(drive);
        return mapper.toDriveResponse(saved, applicationRepository.countByDriveId(saved.getId()), null, false);
    }

    @Transactional
    public void deleteDrive(Long id) {
        PlacementDrive drive = driveRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Placement drive not found with id: " + id));
        driveRepository.delete(drive);
    }

    private void validateDates(PlacementDriveRequest request) {
        if (request.driveDate().isBefore(request.applicationDeadline())) {
            throw new BadRequestException("Drive date cannot be earlier than the application deadline");
        }
    }

    private void applyFields(PlacementDrive drive, Company company, PlacementDriveRequest request) {
        drive.setCompany(company);
        drive.setJobTitle(request.jobTitle().trim());
        drive.setJobDescription(request.jobDescription().trim());
        drive.setJobType(request.jobType());
        drive.setJobLocation(request.jobLocation().trim());
        drive.setPackageLpa(request.packageLpa());
        drive.setMinCgpa(request.minCgpa());
        drive.setMaxBacklogs(request.maxBacklogs());
        drive.setEligibleBranches(normalizeBranches(request.eligibleBranches()));
        drive.setPassingYear(request.passingYear());
        drive.setApplicationDeadline(request.applicationDeadline());
        drive.setDriveDate(request.driveDate());
        drive.setRequiredSkills(request.requiredSkills() != null ? request.requiredSkills().trim() : null);
        drive.setSelectionProcess(request.selectionProcess() != null ? request.selectionProcess().trim() : null);
        drive.setStatus(request.status() != null ? request.status() : DriveStatus.OPEN);
        drive.setPublished(request.published() != null ? request.published() : true);
    }

    private String normalizeBranches(String raw) {
        return Arrays.stream(raw.split(","))
            .map(String::trim)
            .map(String::toUpperCase)
            .filter(s -> !s.isEmpty())
            .distinct()
            .collect(Collectors.joining(","));
    }

    private boolean matchesBranchFilter(String eligibleBranches, String branchFilter) {
        if (eligibleBranches == null || eligibleBranches.isBlank()) {
            return true;
        }
        Set<String> allowed = Arrays.stream(eligibleBranches.split(","))
            .map(String::trim)
            .map(String::toUpperCase)
            .collect(Collectors.toSet());
        return allowed.contains("ALL") || allowed.contains(branchFilter.trim().toUpperCase());
    }
}
