package com.placementtracker.security;

import com.placementtracker.entity.Student;
import com.placementtracker.entity.User;
import com.placementtracker.repository.StudentRepository;
import com.placementtracker.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;

    public CustomUserDetailsService(UserRepository userRepository, StudentRepository studentRepository) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        String trimmed = identifier == null ? "" : identifier.trim();
        User user = userRepository.findByEmailIgnoreCase(trimmed)
            .or(() -> userRepository.findByUsernameIgnoreCase(trimmed))
            .or(() -> studentRepository.findByEnrollmentNumberIgnoreCase(trimmed).map(Student::getUser))
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + trimmed));

        return org.springframework.security.core.userdetails.User.builder()
            .username(user.getEmail())
            .password(user.getPassword())
            .disabled(!user.isActive())
            .authorities(List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())))
            .build();
    }
}
