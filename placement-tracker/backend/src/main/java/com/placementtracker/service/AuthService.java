package com.placementtracker.service;

import com.placementtracker.dto.request.LoginRequest;
import com.placementtracker.dto.request.RegisterRequest;
import com.placementtracker.dto.response.AuthResponse;
import com.placementtracker.entity.Role;
import com.placementtracker.entity.Student;
import com.placementtracker.entity.User;
import com.placementtracker.exception.BadRequestException;
import com.placementtracker.exception.DuplicateResourceException;
import com.placementtracker.exception.ResourceNotFoundException;
import com.placementtracker.repository.StudentRepository;
import com.placementtracker.repository.UserRepository;
import com.placementtracker.security.JwtService;
import com.placementtracker.security.SecurityUtils;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    public AuthService(
        UserRepository userRepository,
        StudentRepository studentRepository,
        PasswordEncoder passwordEncoder,
        JwtService jwtService,
        AuthenticationManager authenticationManager,
        UserDetailsService userDetailsService
    ) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String identifier = request.identifier().trim();
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(identifier, request.password())
        );

        User user = findByIdentifier(identifier);
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());

        String fullName = user.getRole() == Role.ADMIN
            ? "Placement Administrator"
            : (user.getStudent() != null ? user.getStudent().getFullName() : user.getUsername());
        Long studentId = user.getStudent() != null ? user.getStudent().getId() : null;

        String token = jwtService.generateToken(userDetails, Map.of(
            "role", user.getRole().name(),
            "userId", user.getId()
        ));

        return new AuthResponse(
            token,
            "Bearer",
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getRole(),
            fullName,
            studentId
        );
    }

    @Transactional
    public AuthResponse registerStudent(RegisterRequest request) {
        if (!request.password().equals(request.confirmPassword())) {
            throw new BadRequestException("Password and confirm password do not match");
        }

        String email = request.email().trim().toLowerCase();
        String enrollment = request.enrollmentNumber().trim().toUpperCase();

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new DuplicateResourceException("An account with this college email already exists");
        }
        if (studentRepository.existsByEnrollmentNumberIgnoreCase(enrollment)) {
            throw new DuplicateResourceException("A student with this enrollment number is already registered");
        }

        String baseUsername = enrollment.toLowerCase();
        String username = userRepository.existsByUsernameIgnoreCase(baseUsername)
            ? email
            : baseUsername;

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(Role.STUDENT);
        user.setActive(true);
        User savedUser = userRepository.save(user);

        Student student = new Student();
        student.setUser(savedUser);
        student.setFullName(request.fullName().trim());
        student.setEnrollmentNumber(enrollment);
        student.setBranch(request.branch().trim().toUpperCase());
        student.setSection(request.section().trim().toUpperCase());
        student.setPassingYear(request.passingYear());
        student.setPhoneNumber(request.phoneNumber().trim());
        student.setCgpa(0.0);
        student.setActiveBacklogs(0);
        Student savedStudent = studentRepository.save(student);

        UserDetails userDetails = userDetailsService.loadUserByUsername(savedUser.getEmail());
        String token = jwtService.generateToken(userDetails, Map.of(
            "role", Role.STUDENT.name(),
            "userId", savedUser.getId()
        ));

        return new AuthResponse(
            token,
            "Bearer",
            savedUser.getId(),
            savedUser.getUsername(),
            savedUser.getEmail(),
            Role.STUDENT,
            savedStudent.getFullName(),
            savedStudent.getId()
        );
    }

    public void logout(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwtService.revokeToken(authHeader.substring(7));
        }
    }

    @Transactional(readOnly = true)
    public AuthResponse getCurrentUser() {
        String email = SecurityUtils.getCurrentUserEmail();
        User user = userRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        String fullName = user.getRole() == Role.ADMIN
            ? "Placement Administrator"
            : (user.getStudent() != null ? user.getStudent().getFullName() : user.getUsername());
        Long studentId = user.getStudent() != null ? user.getStudent().getId() : null;
        return new AuthResponse(
            null,
            "Bearer",
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getRole(),
            fullName,
            studentId
        );
    }

    private User findByIdentifier(String identifier) {
        return userRepository.findByEmailIgnoreCase(identifier)
            .or(() -> userRepository.findByUsernameIgnoreCase(identifier))
            .or(() -> studentRepository.findByEnrollmentNumberIgnoreCase(identifier).map(Student::getUser))
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
