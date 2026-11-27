package com.placementtracker.repository;

import com.placementtracker.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUserId(Long userId);
    Optional<Student> findByUserEmailIgnoreCase(String email);
    Optional<Student> findByEnrollmentNumberIgnoreCase(String enrollmentNumber);
    boolean existsByEnrollmentNumberIgnoreCase(String enrollmentNumber);

    @Query("""
        SELECT s FROM Student s JOIN FETCH s.user u
        WHERE (:search IS NULL OR :search = '' OR
               LOWER(s.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(s.enrollmentNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:branch IS NULL OR :branch = '' OR UPPER(s.branch) = UPPER(:branch))
          AND (:passingYear IS NULL OR s.passingYear = :passingYear)
        ORDER BY s.createdAt DESC
    """)
    List<Student> searchStudents(
        @Param("search") String search,
        @Param("branch") String branch,
        @Param("passingYear") Integer passingYear
    );

    @Query("SELECT COUNT(DISTINCT s.id) FROM Student s JOIN s.applications a WHERE a.status = 'SELECTED'")
    long countPlacedStudents();
}
