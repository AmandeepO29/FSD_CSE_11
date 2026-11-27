package com.placementtracker.mapper;

import com.placementtracker.dto.response.*;
import com.placementtracker.entity.*;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class EntityMapper {

    public StudentResponse toStudentResponse(Student student, int applicationsCount, int selectedCount) {
        boolean hasUploadedResume = student.getResumeFileName() != null && !student.getResumeFileName().isBlank();
        return new StudentResponse(
            student.getId(),
            student.getUser().getId(),
            student.getUser().getUsername(),
            student.getUser().getEmail(),
            student.getUser().isActive(),
            student.getFullName(),
            student.getEnrollmentNumber(),
            student.getPhoneNumber(),
            student.getBranch(),
            student.getSection(),
            student.getPassingYear(),
            student.getCgpa(),
            student.getActiveBacklogs(),
            student.getTechnicalSkills(),
            student.getResumeUrl(),
            hasUploadedResume,
            student.getResumeFileName(),
            student.getLinkedinUrl(),
            student.getGithubUrl(),
            student.getPortfolioUrl(),
            calculateProfileCompletion(student),
            applicationsCount,
            selectedCount,
            student.getCreatedAt(),
            student.getUpdatedAt()
        );
    }

    public int calculateProfileCompletion(Student s) {
        int total = 10;
        int filled = 0;
        if (hasText(s.getFullName())) filled++;
        if (hasText(s.getEnrollmentNumber())) filled++;
        if (hasText(s.getPhoneNumber())) filled++;
        if (hasText(s.getBranch()) && hasText(s.getSection()) && s.getPassingYear() != null) filled++;
        if (s.getCgpa() != null && s.getCgpa() > 0.0) filled++;
        if (hasText(s.getTechnicalSkills())) filled++;
        if (hasText(s.getResumeFileName()) || hasText(s.getResumeUrl())) filled++;
        if (hasText(s.getLinkedinUrl())) filled++;
        if (hasText(s.getGithubUrl())) filled++;
        if (hasText(s.getPortfolioUrl())) filled++;
        return (int) Math.round((filled * 100.0) / total);
    }

    public CompanyResponse toCompanyResponse(Company company, int totalDrives, int activeDrives) {
        return new CompanyResponse(
            company.getId(),
            company.getName(),
            company.getIndustry(),
            company.getWebsite(),
            company.getLocation(),
            company.getDescription(),
            company.getHrContactEmail(),
            totalDrives,
            activeDrives,
            company.getCreatedAt(),
            company.getUpdatedAt()
        );
    }

    public PlacementDriveResponse toDriveResponse(
        PlacementDrive drive,
        long applicationCount,
        EligibilityResultResponse eligibility,
        boolean alreadyApplied
    ) {
        Company c = drive.getCompany();
        return new PlacementDriveResponse(
            drive.getId(),
            c.getId(),
            c.getName(),
            c.getIndustry(),
            c.getLocation(),
            c.getWebsite(),
            drive.getJobTitle(),
            drive.getJobDescription(),
            drive.getJobType(),
            drive.getJobLocation(),
            drive.getPackageLpa(),
            drive.getMinCgpa(),
            drive.getMaxBacklogs(),
            drive.getEligibleBranches(),
            drive.getPassingYear(),
            drive.getApplicationDeadline(),
            drive.getDriveDate(),
            drive.getRequiredSkills(),
            drive.getSelectionProcess(),
            drive.getStatus(),
            drive.isPublished(),
            applicationCount,
            eligibility,
            alreadyApplied,
            drive.getCreatedAt(),
            drive.getUpdatedAt()
        );
    }

    public ApplicationResponse toApplicationResponse(Application application, List<ApplicationStatusHistory> historyList) {
        Student s = application.getStudent();
        PlacementDrive d = application.getDrive();
        Company c = d.getCompany();
        boolean hasUploadedResume = s.getResumeFileName() != null && !s.getResumeFileName().isBlank();
        List<ApplicationStatusHistoryResponse> history = historyList.stream()
            .map(h -> new ApplicationStatusHistoryResponse(
                h.getId(),
                h.getStatus(),
                h.getRemarks(),
                h.getChangedBy(),
                h.getChangedAt()
            ))
            .toList();

        return new ApplicationResponse(
            application.getId(),
            s.getId(),
            s.getFullName(),
            s.getEnrollmentNumber(),
            s.getUser().getEmail(),
            s.getBranch(),
            s.getSection(),
            s.getPassingYear(),
            s.getCgpa(),
            s.getActiveBacklogs(),
            hasUploadedResume,
            s.getResumeUrl(),
            d.getId(),
            d.getJobTitle(),
            d.getJobType(),
            d.getJobLocation(),
            d.getPackageLpa(),
            c.getId(),
            c.getName(),
            application.getStatus(),
            application.getRemarks(),
            application.getAppliedAt(),
            application.getUpdatedAt(),
            history
        );
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
