package com.placementtracker.repository;

import com.placementtracker.entity.DriveStatus;
import com.placementtracker.entity.JobType;
import com.placementtracker.entity.PlacementDrive;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface PlacementDriveRepository extends JpaRepository<PlacementDrive, Long> {
    long countByStatusAndPublishedTrue(DriveStatus status);
    long countByPublishedTrue();

    @Query("""
        SELECT d FROM PlacementDrive d JOIN FETCH d.company c
        WHERE (:publishedOnly = false OR d.published = true)
          AND (:search IS NULL OR :search = '' OR
               LOWER(d.jobTitle) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(d.jobLocation) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:companyId IS NULL OR c.id = :companyId)
          AND (:jobType IS NULL OR d.jobType = :jobType)
          AND (:status IS NULL OR d.status = :status)
          AND (:minPackage IS NULL OR d.packageLpa >= :minPackage)
          AND (:deadlineBefore IS NULL OR d.applicationDeadline <= :deadlineBefore)
        ORDER BY d.createdAt DESC
    """)
    List<PlacementDrive> searchDrives(
        @Param("publishedOnly") boolean publishedOnly,
        @Param("search") String search,
        @Param("companyId") Long companyId,
        @Param("jobType") JobType jobType,
        @Param("status") DriveStatus status,
        @Param("minPackage") Double minPackage,
        @Param("deadlineBefore") LocalDate deadlineBefore
    );

    List<PlacementDrive> findTop6ByPublishedTrueOrderByCreatedAtDesc();
}
