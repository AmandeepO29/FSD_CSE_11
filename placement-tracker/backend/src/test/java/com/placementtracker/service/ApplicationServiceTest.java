package com.placementtracker.service;

import com.placementtracker.dto.request.ApplicationCreateRequest;
import com.placementtracker.dto.request.ApplicationStatusUpdateRequest;
import com.placementtracker.dto.response.ApplicationResponse;
import com.placementtracker.dto.response.EligibilityResultResponse;
import com.placementtracker.entity.*;
import com.placementtracker.exception.BadRequestException;
import com.placementtracker.exception.DuplicateResourceException;
import com.placementtracker.mapper.EntityMapper;
import com.placementtracker.repository.*;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApplicationServiceTest {

    @Mock
    private ApplicationRepository applicationRepository;
    @Mock
    private ApplicationStatusHistoryRepository historyRepository;
    @Mock
    private StudentRepository studentRepository;
    @Mock
    private PlacementDriveRepository driveRepository;
    @Mock
    private EligibilityService eligibilityService;

    private ApplicationService applicationService;
    private Student student;
    private PlacementDrive drive;

    @BeforeEach
    void setUp() {
        applicationService = new ApplicationService(
            applicationRepository,
            historyRepository,
            studentRepository,
            driveRepository,
            eligibilityService,
            new EntityMapper()
        );

        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken("student@abesec.ac.in", null, List.of())
        );

        User user = new User();
        user.setId(1L);
        user.setEmail("student@abesec.ac.in");

        student = new Student();
        student.setId(10L);
        student.setUser(user);
        student.setFullName("Test Student");
        student.setEnrollmentNumber("2026CSE999");
        student.setBranch("CSE");
        student.setSection("A");
        student.setPassingYear(2026);
        student.setCgpa(8.5);
        student.setActiveBacklogs(0);

        Company company = new Company();
        company.setId(5L);
        company.setName("Acme Corp");

        drive = new PlacementDrive();
        drive.setId(20L);
        drive.setCompany(company);
        drive.setJobTitle("SDE");
        drive.setJobType(JobType.FULL_TIME);
        drive.setJobLocation("Noida");
        drive.setPackageLpa(12.0);
        drive.setStatus(DriveStatus.OPEN);
        drive.setPublished(true);
        drive.setApplicationDeadline(LocalDate.now().plusDays(5));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void shouldCreateApplicationAndInitialHistoryWhenEligible() {
        when(studentRepository.findByUserEmailIgnoreCase("student@abesec.ac.in")).thenReturn(Optional.of(student));
        when(driveRepository.findById(20L)).thenReturn(Optional.of(drive));
        when(applicationRepository.existsByStudentIdAndDriveId(10L, 20L)).thenReturn(false);
        when(eligibilityService.evaluate(student, drive)).thenReturn(new EligibilityResultResponse(true, List.of()));
        when(applicationRepository.save(any(Application.class))).thenAnswer(inv -> {
            Application a = inv.getArgument(0);
            a.setId(100L);
            return a;
        });
        when(historyRepository.findByApplicationIdOrderByChangedAtAsc(100L)).thenReturn(List.of());

        ApplicationResponse response = applicationService.applyForDrive(new ApplicationCreateRequest(20L));

        assertEquals(100L, response.id());
        assertEquals(ApplicationStatus.APPLIED, response.status());
        verify(historyRepository, times(1)).save(any(ApplicationStatusHistory.class));
    }

    @Test
    void shouldPreventDuplicateApplication() {
        when(studentRepository.findByUserEmailIgnoreCase("student@abesec.ac.in")).thenReturn(Optional.of(student));
        when(driveRepository.findById(20L)).thenReturn(Optional.of(drive));
        when(applicationRepository.existsByStudentIdAndDriveId(10L, 20L)).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> applicationService.applyForDrive(new ApplicationCreateRequest(20L)));
        verify(applicationRepository, never()).save(any());
    }

    @Test
    void shouldRejectIneligibleApplication() {
        when(studentRepository.findByUserEmailIgnoreCase("student@abesec.ac.in")).thenReturn(Optional.of(student));
        when(driveRepository.findById(20L)).thenReturn(Optional.of(drive));
        when(applicationRepository.existsByStudentIdAndDriveId(10L, 20L)).thenReturn(false);
        when(eligibilityService.evaluate(student, drive)).thenReturn(
            new EligibilityResultResponse(false, List.of("Minimum CGPA required is 9.0"))
        );

        assertThrows(BadRequestException.class, () -> applicationService.applyForDrive(new ApplicationCreateRequest(20L)));
    }

    @Test
    void shouldUpdateStatusAndAppendHistory() {
        Application existing = new Application();
        existing.setId(100L);
        existing.setStudent(student);
        existing.setDrive(drive);
        existing.setStatus(ApplicationStatus.APPLIED);

        when(applicationRepository.findById(100L)).thenReturn(Optional.of(existing));
        when(applicationRepository.save(any(Application.class))).thenAnswer(inv -> inv.getArgument(0));
        when(historyRepository.findByApplicationIdOrderByChangedAtAsc(100L)).thenReturn(List.of());

        ApplicationResponse updated = applicationService.updateApplicationStatus(
            100L,
            new ApplicationStatusUpdateRequest(ApplicationStatus.SHORTLISTED, "Passed OA")
        );

        assertEquals(ApplicationStatus.SHORTLISTED, updated.status());
        assertEquals("Passed OA", updated.remarks());
        verify(historyRepository, times(1)).save(any(ApplicationStatusHistory.class));
    }
}
