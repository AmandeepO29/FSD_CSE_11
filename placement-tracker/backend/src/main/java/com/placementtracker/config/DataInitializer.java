package com.placementtracker.config;

import com.placementtracker.entity.*;
import com.placementtracker.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final CompanyRepository companyRepository;
    private final PlacementDriveRepository driveRepository;
    private final ApplicationRepository applicationRepository;
    private final ApplicationStatusHistoryRepository historyRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.enabled:true}")
    private boolean seedEnabled;

    @Value("${app.seed.admin.username:admin}")
    private String adminUsername;

    @Value("${app.seed.admin.email:admin@abesec.ac.in}")
    private String adminEmail;

    @Value("${app.seed.admin.password:Admin@123}")
    private String adminPassword;

    @Value("${app.seed.student.username:2026cs001}")
    private String demoStudentUsername;

    @Value("${app.seed.student.email:aarav.sharma@abesec.ac.in}")
    private String demoStudentEmail;

    @Value("${app.seed.student.password:Student@123}")
    private String demoStudentPassword;

    @Value("${app.seed.student.full-name:Aarav Sharma}")
    private String demoStudentName;

    @Value("${app.seed.student.enrollment-number:2026CSE001}")
    private String demoStudentEnrollment;

    @Value("${app.seed.student.branch:CSE}")
    private String demoStudentBranch;

    @Value("${app.seed.student.section:A}")
    private String demoStudentSection;

    @Value("${app.seed.student.passing-year:2026}")
    private Integer demoStudentPassingYear;

    @Value("${app.seed.student.phone:9876543210}")
    private String demoStudentPhone;

    public DataInitializer(
        UserRepository userRepository,
        StudentRepository studentRepository,
        CompanyRepository companyRepository,
        PlacementDriveRepository driveRepository,
        ApplicationRepository applicationRepository,
        ApplicationStatusHistoryRepository historyRepository,
        PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.companyRepository = companyRepository;
        this.driveRepository = driveRepository;
        this.applicationRepository = applicationRepository;
        this.historyRepository = historyRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedEnabled) {
            return;
        }

        seedAdminUser();
        Student demoStudent = seedDemoStudent();

        if (companyRepository.count() == 0) {
            seedSampleCampusData(demoStudent);
        }
    }

    private void seedAdminUser() {
        if (!userRepository.existsByEmailIgnoreCase(adminEmail) && !userRepository.existsByUsernameIgnoreCase(adminUsername)) {
            User admin = new User();
            admin.setUsername(adminUsername.trim());
            admin.setEmail(adminEmail.trim().toLowerCase());
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRole(Role.ADMIN);
            admin.setActive(true);
            userRepository.save(admin);
        }
    }

    private Student seedDemoStudent() {
        return userRepository.findByEmailIgnoreCase(demoStudentEmail)
            .map(User::getStudent)
            .orElseGet(() -> {
                User user = new User();
                user.setUsername(demoStudentUsername.trim());
                user.setEmail(demoStudentEmail.trim().toLowerCase());
                user.setPassword(passwordEncoder.encode(demoStudentPassword));
                user.setRole(Role.STUDENT);
                user.setActive(true);
                User savedUser = userRepository.save(user);

                Student student = new Student();
                student.setUser(savedUser);
                student.setFullName(demoStudentName);
                student.setEnrollmentNumber(demoStudentEnrollment);
                student.setBranch(demoStudentBranch);
                student.setSection(demoStudentSection);
                student.setPassingYear(demoStudentPassingYear);
                student.setPhoneNumber(demoStudentPhone);
                student.setCgpa(8.45);
                student.setActiveBacklogs(0);
                student.setTechnicalSkills("Java, Spring Boot, React, MySQL, Data Structures, Tailwind CSS");
                student.setLinkedinUrl("https://linkedin.com/in/aarav-sharma-abesec");
                student.setGithubUrl("https://github.com/aarav-sharma-dev");
                return studentRepository.save(student);
            });
    }

    private void seedSampleCampusData(Student demoStudent) {
        Student priya = createAdditionalStudent(
            "2026it014", "priya.verma@abesec.ac.in", "Priya Verma",
            "2026IT014", "IT", "B", 2026, 8.92, 0, "Python, React, TypeScript, PostgreSQL, Docker"
        );
        Student rohan = createAdditionalStudent(
            "2026ece022", "rohan.mehta@abesec.ac.in", "Rohan Mehta",
            "2026ECE022", "ECE", "A", 2026, 7.65, 0, "C++, Embedded Systems, Java, SQL"
        );
        Student ananya = createAdditionalStudent(
            "2026cs045", "ananya.gupta@abesec.ac.in", "Ananya Gupta",
            "2026CSE045", "CSE-AIML", "A", 2026, 9.15, 0, "Python, Machine Learning, FastAPI, React"
        );

        Company tcs = createCompany("TCS Digital", "IT Services & Consulting", "https://www.tcs.com", "Noida / Pan-India",
            "Global IT services, consulting, and business solutions organization hiring engineering graduates.", "campus.india@tcs.com");
        Company infosys = createCompany("Infosys SP", "Technology & Consulting", "https://www.infosys.com", "Bengaluru / Pune",
            "Specialist Programmer track focused on full-stack engineering and cloud-native platforms.", "talent.acquisition@infosys.com");
        Company adobe = createCompany("Adobe Systems", "Product & SaaS", "https://www.adobe.com", "Noida",
            "Leading digital experience and creative cloud software engineering company.", "university-india@adobe.com");
        Company josh = createCompany("Josh Technology Group", "Product Engineering", "https://www.joshtechnologygroup.com", "Gurugram",
            "High-growth product engineering firm building scalable SaaS platforms.", "careers@joshtechnologygroup.com");

        PlacementDrive adobeDrive = createDrive(
            adobe, "Software Development Engineer - I",
            "Build scalable cloud services and modern web experiences across Creative Cloud products.",
            JobType.FULL_TIME, "Noida", 18.5, 8.0, 0, "CSE,CSE-AIML,CSE-DS,IT", 2026,
            LocalDate.now().plusDays(14), LocalDate.now().plusDays(21),
            "Java, Data Structures, Algorithms, React, System Design",
            "Online Coding Test -> 2 Technical Interviews -> HR Round",
            DriveStatus.OPEN, true
        );
        PlacementDrive joshDrive = createDrive(
            josh, "Associate Software Engineer",
            "Full-stack engineering role working with JavaScript, React, Node/Java, and relational databases.",
            JobType.INTERNSHIP_PPO, "Gurugram", 10.5, 7.0, 0, "CSE,CSE-AIML,CSE-DS,IT,ECE", 2026,
            LocalDate.now().plusDays(10), LocalDate.now().plusDays(16),
            "JavaScript, React, Java, SQL, Problem Solving",
            "MCQ + Coding Round -> Technical Interviews -> Culture Fit",
            DriveStatus.OPEN, true
        );
        PlacementDrive tcsDrive = createDrive(
            tcs, "Systems Engineer (Digital Cadre)",
            "Work on enterprise digital transformation, cloud migration, and full-stack microservices.",
            JobType.FULL_TIME, "Noida / Bengaluru", 7.2, 6.5, 1, "ALL", 2026,
            LocalDate.now().plusDays(20), LocalDate.now().plusDays(28),
            "Java, Python, SQL, Spring Boot, Cloud Basics",
            "TCS NQT -> Technical Interview -> Managerial & HR Interview",
            DriveStatus.OPEN, true
        );
        PlacementDrive infosysDrive = createDrive(
            infosys, "Specialist Programmer",
            "Solve complex algorithmic and distributed architecture problems in enterprise engineering teams.",
            JobType.FULL_TIME, "Pune / Bengaluru", 9.5, 7.5, 0, "CSE,IT,CSE-AIML", 2026,
            LocalDate.now().plusDays(5), LocalDate.now().plusDays(12),
            "Algorithms, Java, C++, Spring Boot, Distributed Systems",
            "HackWithInfy Coding -> Technical Interview",
            DriveStatus.OPEN, true
        );

        createApplicationWithHistory(demoStudent, joshDrive, ApplicationStatus.SHORTLISTED,
            "Cleared online coding assessment with top percentile", "admin@abesec.ac.in");
        createApplicationWithHistory(priya, adobeDrive, ApplicationStatus.SELECTED,
            "Selected after final technical and HR panel", "admin@abesec.ac.in");
        createApplicationWithHistory(ananya, adobeDrive, ApplicationStatus.INTERVIEW_SCHEDULED,
            "Technical round scheduled for Friday 10:00 AM", "admin@abesec.ac.in");
        createApplicationWithHistory(rohan, tcsDrive, ApplicationStatus.UNDER_REVIEW,
            "Profile verified by placement cell", "admin@abesec.ac.in");
    }

    private Student createAdditionalStudent(
        String username, String email, String fullName, String enrollment,
        String branch, String section, int year, double cgpa, int backlogs, String skills
    ) {
        User u = new User();
        u.setUsername(username);
        u.setEmail(email);
        u.setPassword(passwordEncoder.encode("Student@123"));
        u.setRole(Role.STUDENT);
        u.setActive(true);
        User savedUser = userRepository.save(u);

        Student s = new Student();
        s.setUser(savedUser);
        s.setFullName(fullName);
        s.setEnrollmentNumber(enrollment);
        s.setBranch(branch);
        s.setSection(section);
        s.setPassingYear(year);
        s.setPhoneNumber("9876500001");
        s.setCgpa(cgpa);
        s.setActiveBacklogs(backlogs);
        s.setTechnicalSkills(skills);
        return studentRepository.save(s);
    }

    private Company createCompany(String name, String industry, String website, String location, String desc, String email) {
        Company c = new Company();
        c.setName(name);
        c.setIndustry(industry);
        c.setWebsite(website);
        c.setLocation(location);
        c.setDescription(desc);
        c.setHrContactEmail(email);
        return companyRepository.save(c);
    }

    private PlacementDrive createDrive(
        Company company, String title, String desc, JobType jobType, String location,
        double pkg, double minCgpa, int maxBacklogs, String branches, int year,
        LocalDate deadline, LocalDate driveDate, String skills, String process,
        DriveStatus status, boolean published
    ) {
        PlacementDrive d = new PlacementDrive();
        d.setCompany(company);
        d.setJobTitle(title);
        d.setJobDescription(desc);
        d.setJobType(jobType);
        d.setJobLocation(location);
        d.setPackageLpa(pkg);
        d.setMinCgpa(minCgpa);
        d.setMaxBacklogs(maxBacklogs);
        d.setEligibleBranches(branches);
        d.setPassingYear(year);
        d.setApplicationDeadline(deadline);
        d.setDriveDate(driveDate);
        d.setRequiredSkills(skills);
        d.setSelectionProcess(process);
        d.setStatus(status);
        d.setPublished(published);
        return driveRepository.save(d);
    }

    private void createApplicationWithHistory(
        Student student, PlacementDrive drive, ApplicationStatus finalStatus, String remarks, String actor
    ) {
        Application app = new Application();
        app.setStudent(student);
        app.setDrive(drive);
        app.setStatus(finalStatus);
        app.setRemarks(remarks);
        Application saved = applicationRepository.save(app);

        ApplicationStatusHistory h1 = new ApplicationStatusHistory();
        h1.setApplication(saved);
        h1.setStatus(ApplicationStatus.APPLIED);
        h1.setRemarks("Application submitted");
        h1.setChangedBy(student.getFullName());
        historyRepository.save(h1);

        if (finalStatus != ApplicationStatus.APPLIED) {
            ApplicationStatusHistory h2 = new ApplicationStatusHistory();
            h2.setApplication(saved);
            h2.setStatus(finalStatus);
            h2.setRemarks(remarks);
            h2.setChangedBy(actor);
            historyRepository.save(h2);
        }
    }
}
