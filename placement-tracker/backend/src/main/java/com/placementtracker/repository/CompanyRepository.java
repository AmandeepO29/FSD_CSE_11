package com.placementtracker.repository;

import com.placementtracker.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CompanyRepository extends JpaRepository<Company, Long> {
    boolean existsByNameIgnoreCase(String name);
    Optional<Company> findByNameIgnoreCase(String name);

    @Query("""
        SELECT c FROM Company c
        WHERE (:search IS NULL OR :search = '' OR
               LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(c.industry) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(c.location) LIKE LOWER(CONCAT('%', :search, '%')))
        ORDER BY c.createdAt DESC
    """)
    List<Company> searchCompanies(@Param("search") String search);
}
