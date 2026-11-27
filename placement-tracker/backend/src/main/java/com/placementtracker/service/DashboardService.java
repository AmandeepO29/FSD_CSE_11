package com.placementtracker.service;

import com.placementtracker.dto.response.*;
import com.placementtracker.dto.response.AdminDashboardResponse.*;
import com.placementtracker.entity.*;
import com.placementtracker.exception.ResourceNotFoundException;
import com.placementtracker.mapper.EntityMapper;
import com.placementtracker.repository.*;
import com.placementtracker.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final StudentRepository studentRepository;
    private final CompanyRepository companyRepository;
    private final PlacementDriveRepository driveRepository;
    private final ApplicationRepository applicationRepository;
    private final ApplicationStatusHistoryRepository historyRepository;
    private final EligibilityService eligibilityService;
    private final EntityMapper mapper;

    public DashboardService(
        StudentRepository studentRepository,
        CompanyRepository companyRepository,
        PlacementDriveRepository driveRepository,
        ApplicationRepository applicationRepository,
        ApplicationStatusHistoryRepository historyRepository,
        EligibilityService eligibilityService,
        EntityMapper mapper
    ) {
        this.studentRepository = studentRepository;
        this.companyRepository = companyRepository;
        this.driveRepository = driveRepository;
        this.applicationRepository = applicationRepository;
        this.historyRepository = historyRepository;
        this.eligibilityService = eligibilityService;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public PublicOverviewResponse getPublicOverview() {
        long totalStudents = studentRepository.count();
        long totalCompanies = companyRepository.count();
        long activeDrives = driveRepository.countByStatusAndPublishedTrue(DriveStatus.OPEN);
        long studentsPlaced = studentRepository.countPlacedStudents();
        double placementPct = totalStudents > 0 ? roundTwo((studentsPlaced * 100.0) / totalStudents) : 0.0;

        List<Application> selectedApps = applicationRepository.findAllWithDetails().stream()
            .filter(a -> a.getStatus() == ApplicationStatus.SELECTED)
            .toList();

        double highestPkg = selectedApps.stream()
            .mapToDouble(a -> a.getDrive().getPackageLpa())
            .max()
            .orElseGet(() -> driveRepository.findAll().stream()
                .mapToDouble(PlacementDrive::getPackageLpa)
                .max()
                .orElse(0.0));

        double avgPkg = selectedApps.stream()
            .mapToDouble(a -> a.getDrive().getPackageLpa())
            .average()
            .orElse(0.0);

        List<PlacementDriveResponse> featuredDrives = driveRepository.findTop6ByPublishedTrueOrderByCreatedAtDesc().stream()
            .map(d -> mapper.toDriveResponse(d, applicationRepository.countByDriveId(d.getId()), null, false))
            .toList();

        return new PublicOverviewResponse(
            totalStudents,
            totalCompanies,
            activeDrives,
            studentsPlaced,
            placementPct,
            roundTwo(highestPkg),
            roundTwo(avgPkg),
            featuredDrives
        );
    }

    @Transactional(readOnly = true)
    public AdminDashboardResponse getAdminDashboard() {
        List<Student> students = studentRepository.findAll();
        List<Company> companies = companyRepository.findAll();
        List<Application> applications = applicationRepository.findAllWithDetails();

        long totalStudents = students.size();
        long totalCompanies = companies.size();
        long activeDrives = driveRepository.countByStatusAndPublishedTrue(DriveStatus.OPEN);
        long totalApplications = applications.size();

        Set<Long> placedStudentIds = applications.stream()
            .filter(a -> a.getStatus() == ApplicationStatus.SELECTED)
            .map(a -> a.getStudent().getId())
            .collect(Collectors.toSet());
        long studentsPlaced = placedStudentIds.size();
        double placementPercentage = totalStudents > 0 ? roundTwo((studentsPlaced * 100.0) / totalStudents) : 0.0;

        List<Application> selectedApps = applications.stream()
            .filter(a -> a.getStatus() == ApplicationStatus.SELECTED)
            .toList();

        double averagePackageLpa = roundTwo(selectedApps.stream()
            .mapToDouble(a -> a.getDrive().getPackageLpa())
            .average()
            .orElse(0.0));
        double highestPackageLpa = roundTwo(selectedApps.stream()
            .mapToDouble(a -> a.getDrive().getPackageLpa())
            .max()
            .orElse(0.0));

        // Branch-wise placements
        Map<String, List<Student>> studentsByBranch = students.stream()
            .collect(Collectors.groupingBy(s -> s.getBranch().toUpperCase()));
        List<BranchPlacementStat> branchWise = studentsByBranch.entrySet().stream()
            .sorted(Map.Entry.comparingByKey())
            .map(entry -> {
                long totalInBranch = entry.getValue().size();
                long placedInBranch = entry.getValue().stream()
                    .filter(s -> placedStudentIds.contains(s.getId()))
                    .count();
                double pct = totalInBranch > 0 ? roundTwo((placedInBranch * 100.0) / totalInBranch) : 0.0;
                return new BranchPlacementStat(entry.getKey(), totalInBranch, placedInBranch, pct);
            })
            .toList();

        // Company-wise applications
        Map<String, List<Application>> appsByCompany = applications.stream()
            .collect(Collectors.groupingBy(a -> a.getDrive().getCompany().getName()));
        List<CompanyApplicationStat> companyWise = companies.stream()
            .map(c -> {
                List<Application> companyApps = appsByCompany.getOrDefault(c.getName(), List.of());
                long selectedCount = companyApps.stream()
                    .filter(a -> a.getStatus() == ApplicationStatus.SELECTED)
                    .count();
                return new CompanyApplicationStat(c.getName(), companyApps.size(), selectedCount);
            })
            .sorted(Comparator.comparingLong(CompanyApplicationStat::applicationsCount).reversed())
            .limit(8)
            .toList();

        // Monthly placement trends (last 6 months including current)
        YearMonth currentMonth = YearMonth.now();
        List<MonthlyTrendStat> monthlyTrends = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            YearMonth ym = currentMonth.minusMonths(i);
            long monthApps = applications.stream()
                .filter(a -> a.getAppliedAt() != null && YearMonth.from(a.getAppliedAt()).equals(ym))
                .count();
            long monthSelected = applications.stream()
                .filter(a -> a.getStatus() == ApplicationStatus.SELECTED
                    && a.getUpdatedAt() != null
                    && YearMonth.from(a.getUpdatedAt()).equals(ym))
                .count();
            String label = ym.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + " " + ym.getYear();
            monthlyTrends.add(new MonthlyTrendStat(label, monthApps, monthSelected));
        }

        // Selection statistics by status
        List<StatusStat> selectionStats = Arrays.stream(ApplicationStatus.values())
            .map(st -> new StatusStat(
                st.name(),
                applications.stream().filter(a -> a.getStatus() == st).count()
            ))
            .toList();

        return new AdminDashboardResponse(
            totalStudents,
            totalCompanies,
            activeDrives,
            totalApplications,
            studentsPlaced,
            placementPercentage,
            averagePackageLpa,
            highestPackageLpa,
            branchWise,
            companyWise,
            monthlyTrends,
            selectionStats
        );
    }

    @Transactional(readOnly = true)
    public StudentDashboardResponse getStudentDashboard() {
        String email = SecurityUtils.getCurrentUserEmail();
        Student student = studentRepository.findByUserEmailIgnoreCase(email)
            .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        List<PlacementDrive> publishedDrives = driveRepository.searchDrives(true, null, null, null, null, null, null);
        List<Application> myApplications = applicationRepository.findAllByStudentIdWithDetails(student.getId());
        Set<Long> appliedDriveIds = myApplications.stream()
            .map(a -> a.getDrive().getId())
            .collect(Collectors.toSet());

        List<PlacementDriveResponse> driveResponses = publishedDrives.stream()
            .map(d -> {
                EligibilityResultResponse eligibility = eligibilityService.evaluate(student, d);
                return mapper.toDriveResponse(
                    d,
                    applicationRepository.countByDriveId(d.getId()),
                    eligibility,
                    appliedDriveIds.contains(d.getId())
                );
            })
            .toList();

        long totalAvailableDrives = driveResponses.stream()
            .filter(d -> d.status() == DriveStatus.OPEN)
            .count();
        long eligibleDrives = driveResponses.stream()
            .filter(d -> d.eligibility() != null && d.eligibility().eligible())
            .count();
        long appliedDrives = myApplications.size();
        long selectedOpportunities = myApplications.stream()
            .filter(a -> a.getStatus() == ApplicationStatus.SELECTED)
            .count();

        List<ApplicationResponse> recentApplications = myApplications.stream()
            .limit(5)
            .map(a -> mapper.toApplicationResponse(a, historyRepository.findByApplicationIdOrderByChangedAtAsc(a.getId())))
            .toList();

        return new StudentDashboardResponse(
            student.getFullName(),
            student.getEnrollmentNumber(),
            student.getBranch(),
            student.getSection(),
            student.getPassingYear(),
            student.getCgpa(),
            student.getActiveBacklogs(),
            mapper.calculateProfileCompletion(student),
            totalAvailableDrives,
            eligibleDrives,
            appliedDrives,
            selectedOpportunities,
            driveResponses.stream().limit(5).toList(),
            recentApplications
        );
    }

    private double roundTwo(double val) {
        return Math.round(val * 100.0) / 100.0;
    }
}
