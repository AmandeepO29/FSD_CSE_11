package com.placementtracker.service;

import com.placementtracker.dto.request.CompanyRequest;
import com.placementtracker.dto.response.CompanyResponse;
import com.placementtracker.entity.Company;
import com.placementtracker.exception.DuplicateResourceException;
import com.placementtracker.mapper.EntityMapper;
import com.placementtracker.repository.CompanyRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CompanyServiceTest {

    @Mock
    private CompanyRepository companyRepository;

    private CompanyService companyService;

    @BeforeEach
    void setUp() {
        companyService = new CompanyService(companyRepository, new EntityMapper());
    }

    @Test
    void shouldCreateCompanySuccessfully() {
        CompanyRequest req = new CompanyRequest("Microsoft", "Cloud & Software", "https://microsoft.com", "Hyderabad", "Tech", "hr@microsoft.com");
        when(companyRepository.existsByNameIgnoreCase("Microsoft")).thenReturn(false);
        when(companyRepository.save(any(Company.class))).thenAnswer(inv -> {
            Company c = inv.getArgument(0);
            c.setId(1L);
            return c;
        });

        CompanyResponse res = companyService.createCompany(req);
        assertEquals(1L, res.id());
        assertEquals("Microsoft", res.name());
    }

    @Test
    void shouldRejectDuplicateCompanyName() {
        CompanyRequest req = new CompanyRequest("Microsoft", "Cloud", null, "Hyderabad", null, "hr@microsoft.com");
        when(companyRepository.existsByNameIgnoreCase("Microsoft")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> companyService.createCompany(req));
        verify(companyRepository, never()).save(any());
    }

    @Test
    void shouldUpdateCompany() {
        Company existing = new Company();
        existing.setId(2L);
        existing.setName("OldName");
        existing.setIndustry("IT");
        existing.setLocation("Noida");
        existing.setHrContactEmail("hr@old.com");

        when(companyRepository.findById(2L)).thenReturn(Optional.of(existing));
        when(companyRepository.existsByNameIgnoreCase("NewName")).thenReturn(false);
        when(companyRepository.save(any(Company.class))).thenAnswer(inv -> inv.getArgument(0));

        CompanyResponse updated = companyService.updateCompany(
            2L,
            new CompanyRequest("NewName", "SaaS", "https://new.com", "Bengaluru", "Updated", "hr@new.com")
        );
        assertEquals("NewName", updated.name());
        assertEquals("Bengaluru", updated.location());
    }
}
