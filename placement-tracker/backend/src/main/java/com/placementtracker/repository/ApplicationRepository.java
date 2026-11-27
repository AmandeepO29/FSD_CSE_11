package com.placementtracker.repository;

import com.placementtracker.entity.Application;
import com.placementtracker.entity.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    boolean existsByStudentIdAndDriveId(Long studentId, Long driveId);
    Optional<Application> findByStudentIdAndDriveId(Long studentId, Long driveId);
    long countByStatus(ApplicationStatus status);
    long countByDriveId(Long driveId);

    @Query("""
        SELECT a FROM Application a
        JOIN FETCH a.student s
        JOIN FETCH s.user u
        JOIN FETCH a.drive d
        JOIN FETCH d.company c
        WHERE s.id = :studentId
        ORDER BY a.appliedAt DESC
    """)
    List<Application> findAllByStudentIdWithDetails(@Param("studentId") Long studentId);

    @Query("""
        SELECT a FROM Application a
        JOIN FETCH a.student s
        JOIN FETCH s.user u
        JOIN FETCH a.drive d
        JOIN FETCH d.company c
        WHERE (:companyId IS NULL OR c.id = :companyId)
          AND (:driveId IS NULL OR d.id = :driveId)
          AND (:branch IS NULL OR :branch = '' OR UPPER(s.branch) = UPPER(:branch))
          AND (:status IS NULL OR a.status = :status)
          AND (:search IS NULL OR :search = '' OR
               LOWER(s.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(s.enrollmentNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(d.jobTitle) LIKE LOWER(CONCAT('%', :search, '%')))
        ORDER BY a.appliedAt DESC
    """)
    List<Application> searchApplications(
        @Param("companyId") Long companyId,
        @Param("driveId") Long driveId,
        @Param("branch") String branch,
        @Param("status") ApplicationStatus status,
        @Param("search") String search
    );

    @Query("""
        SELECT a FROM Application a
        JOIN FETCH a.student s
        JOIN FETCH a.drive d
        JOIN FETCH d.company c
    """)
    List<Application> findAllWithDetails();
}
