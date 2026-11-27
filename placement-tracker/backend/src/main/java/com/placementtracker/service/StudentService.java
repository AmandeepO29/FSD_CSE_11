package com.placementtracker.service;

import com.placementtracker.dto.request.AdminCreateStudentRequest;
import com.placementtracker.dto.request.StudentProfileRequest;
import com.placementtracker.dto.response.StudentResponse;
import com.placementtracker.entity.ApplicationStatus;
import com.placementtracker.entity.Role;
import com.placementtracker.entity.Student;
import com.placementtracker.entity.User;
import com.placementtracker.exception.BadRequestException;
import com.placementtracker.exception.DuplicateResourceException;
import com.placementtracker.exception.ResourceNotFoundException;
import com.placementtracker.exception.UnauthorizedException;
import com.placementtracker.mapper.EntityMapper;
import com.placementtracker.repository.StudentRepository;
import com.placementtracker.repository.UserRepository;
import com.placementtracker.security.SecurityUtils;
import com.placementtracker.util.AppConstants;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EntityMapper mapper;

    public StudentService(
        StudentRepository studentRepository,
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        EntityMapper mapper
    ) {
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public Student getCurrentStudentEntity() {
        String email = SecurityUtils.getCurrentUserEmail();
        return studentRepository.findByUserEmailIgnoreCase(email)
            .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for current user"));
    }

    @Transactional(readOnly = true)
    public StudentResponse getCurrentStudentProfile() {
        Student student = getCurrentStudentEntity();
        return toResponseWithStats(student);
    }

    @Transactional
    public StudentResponse updateCurrentStudentProfile(StudentProfileRequest request) {
        Student student = getCurrentStudentEntity();
        String newEnrollment = request.enrollmentNumber().trim().toUpperCase();
        if (!student.getEnrollmentNumber().equalsIgnoreCase(newEnrollment)
            && studentRepository.existsByEnrollmentNumberIgnoreCase(newEnrollment)) {
            throw new DuplicateResourceException("Enrollment number already exists");
        }
        applyProfileFields(student, request);
        Student saved = studentRepository.save(student);
        return toResponseWithStats(saved);
    }

    @Transactional
    public StudentResponse uploadCurrentStudentResume(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Please select a PDF file to upload");
        }
        if (file.getSize() > AppConstants.MAX_RESUME_SIZE_BYTES) {
            throw new BadRequestException("Resume PDF must not exceed 5MB");
        }

        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename().trim() : "resume.pdf";
        String contentType = file.getContentType();
        if ((contentType == null || !contentType.equalsIgnoreCase("application/pdf"))
            && !originalName.toLowerCase().endsWith(".pdf")) {
            throw new BadRequestException("Only PDF files are accepted for resume upload");
        }

        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw new BadRequestException("Failed to read uploaded resume file");
        }

        if (bytes.length < 5 || !new String(bytes, 0, 5, StandardCharsets.US_ASCII).equals("%PDF-")) {
            throw new BadRequestException("Invalid PDF file signature. Please upload a valid PDF document");
        }

        Student student = getCurrentStudentEntity();
        student.setResumeData(bytes);
        student.setResumeFileName(originalName);
        student.setResumeContentType("application/pdf");
        Student saved = studentRepository.save(student);
        return toResponseWithStats(saved);
    }

    @Transactional(readOnly = true)
    public Student getStudentResumeForDownload(Long studentId) {
        Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        if (!SecurityUtils.hasRole("ADMIN")) {
            Student current = getCurrentStudentEntity();
            if (!current.getId().equals(student.getId())) {
                throw new UnauthorizedException("You can only access your own resume");
            }
        }

        if (student.getResumeData() == null || student.getResumeData().length == 0) {
            throw new ResourceNotFoundException("No uploaded PDF resume found for this student");
        }
        return student;
    }

    @Transactional(readOnly = true)
    public List<StudentResponse> searchStudents(String search, String branch, Integer passingYear) {
        return studentRepository.searchStudents(search, branch, passingYear).stream()
            .map(this::toResponseWithStats)
            .toList();
    }

    @Transactional(readOnly = true)
    public StudentResponse getStudentById(Long id) {
        Student student = studentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
        return toResponseWithStats(student);
    }

    @Transactional
    public StudentResponse createStudentByAdmin(AdminCreateStudentRequest request) {
        String email = request.email().trim().toLowerCase();
        String enrollment = request.enrollmentNumber().trim().toUpperCase();

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new DuplicateResourceException("Email is already registered");
        }
        if (studentRepository.existsByEnrollmentNumberIgnoreCase(enrollment)) {
            throw new DuplicateResourceException("Enrollment number already exists");
        }

        String rawPassword = (request.password() != null && !request.password().isBlank())
            ? request.password()
            : "Student@123";

        User user = new User();
        user.setUsername(userRepository.existsByUsernameIgnoreCase(enrollment.toLowerCase()) ? email : enrollment.toLowerCase());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(Role.STUDENT);
        user.setActive(true);
        User savedUser = userRepository.save(user);

        Student student = new Student();
        student.setUser(savedUser);
        student.setFullName(request.fullName().trim());
        student.setEnrollmentNumber(enrollment);
        student.setPhoneNumber(request.phoneNumber().trim());
        student.setBranch(request.branch().trim().toUpperCase());
        student.setSection(request.section().trim().toUpperCase());
        student.setPassingYear(request.passingYear());
        student.setCgpa(request.cgpa() != null ? request.cgpa() : 0.0);
        student.setActiveBacklogs(request.activeBacklogs() != null ? request.activeBacklogs() : 0);
        student.setTechnicalSkills(trimOrNull(request.technicalSkills()));
        student.setResumeUrl(trimOrNull(request.resumeUrl()));
        student.setLinkedinUrl(trimOrNull(request.linkedinUrl()));
        student.setGithubUrl(trimOrNull(request.githubUrl()));
        student.setPortfolioUrl(trimOrNull(request.portfolioUrl()));

        Student saved = studentRepository.save(student);
        return toResponseWithStats(saved);
    }

    @Transactional
    public StudentResponse updateStudentByAdmin(Long id, StudentProfileRequest request) {
        Student student = studentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
        String newEnrollment = request.enrollmentNumber().trim().toUpperCase();
        if (!student.getEnrollmentNumber().equalsIgnoreCase(newEnrollment)
            && studentRepository.existsByEnrollmentNumberIgnoreCase(newEnrollment)) {
            throw new DuplicateResourceException("Enrollment number already exists");
        }
        applyProfileFields(student, request);
        Student saved = studentRepository.save(student);
        return toResponseWithStats(saved);
    }

    @Transactional
    public StudentResponse toggleStudentActive(Long id, boolean active) {
        Student student = studentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
        student.getUser().setActive(active);
        userRepository.save(student.getUser());
        return toResponseWithStats(student);
    }

    @Transactional
    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
        User user = student.getUser();
        studentRepository.delete(student);
        userRepository.delete(user);
    }

    private void applyProfileFields(Student student, StudentProfileRequest request) {
        student.setFullName(request.fullName().trim());
        student.setEnrollmentNumber(request.enrollmentNumber().trim().toUpperCase());
        student.setPhoneNumber(request.phoneNumber().trim());
        student.setBranch(request.branch().trim().toUpperCase());
        student.setSection(request.section().trim().toUpperCase());
        student.setPassingYear(request.passingYear());
        student.setCgpa(request.cgpa());
        student.setActiveBacklogs(request.activeBacklogs());
        student.setTechnicalSkills(trimOrNull(request.technicalSkills()));
        student.setResumeUrl(trimOrNull(request.resumeUrl()));
        student.setLinkedinUrl(trimOrNull(request.linkedinUrl()));
        student.setGithubUrl(trimOrNull(request.githubUrl()));
        student.setPortfolioUrl(trimOrNull(request.portfolioUrl()));
    }

    private StudentResponse toResponseWithStats(Student student) {
        int totalApps = student.getApplications() != null ? student.getApplications().size() : 0;
        int selected = student.getApplications() != null
            ? (int) student.getApplications().stream().filter(a -> a.getStatus() == ApplicationStatus.SELECTED).count()
            : 0;
        return mapper.toStudentResponse(student, totalApps, selected);
    }

    private String trimOrNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
