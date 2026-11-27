package com.placementtracker.service;

import com.placementtracker.dto.request.CompanyRequest;
import com.placementtracker.dto.response.CompanyResponse;
import com.placementtracker.entity.Company;
import com.placementtracker.entity.DriveStatus;
import com.placementtracker.exception.DuplicateResourceException;
import com.placementtracker.exception.ResourceNotFoundException;
import com.placementtracker.mapper.EntityMapper;
import com.placementtracker.repository.CompanyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final EntityMapper mapper;

    public CompanyService(CompanyRepository companyRepository, EntityMapper mapper) {
        this.companyRepository = companyRepository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<CompanyResponse> searchCompanies(String search) {
        return companyRepository.searchCompanies(search).stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public CompanyResponse getCompanyById(Long id) {
        Company company = companyRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + id));
        return toResponse(company);
    }

    @Transactional
    public CompanyResponse createCompany(CompanyRequest request) {
        String name = request.name().trim();
        if (companyRepository.existsByNameIgnoreCase(name)) {
            throw new DuplicateResourceException("Company with name '" + name + "' already exists");
        }
        Company company = new Company();
        applyFields(company, request);
        return toResponse(companyRepository.save(company));
    }

    @Transactional
    public CompanyResponse updateCompany(Long id, CompanyRequest request) {
        Company company = companyRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + id));
        String name = request.name().trim();
        if (!company.getName().equalsIgnoreCase(name) && companyRepository.existsByNameIgnoreCase(name)) {
            throw new DuplicateResourceException("Company with name '" + name + "' already exists");
        }
        applyFields(company, request);
        return toResponse(companyRepository.save(company));
    }

    @Transactional
    public void deleteCompany(Long id) {
        Company company = companyRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + id));
        companyRepository.delete(company);
    }

    private void applyFields(Company company, CompanyRequest request) {
        company.setName(request.name().trim());
        company.setIndustry(request.industry().trim());
        company.setWebsite(request.website() != null ? request.website().trim() : null);
        company.setLocation(request.location().trim());
        company.setDescription(request.description() != null ? request.description().trim() : null);
        company.setHrContactEmail(request.hrContactEmail().trim().toLowerCase());
    }

    private CompanyResponse toResponse(Company company) {
        int totalDrives = company.getPlacementDrives() != null ? company.getPlacementDrives().size() : 0;
        int activeDrives = company.getPlacementDrives() != null
            ? (int) company.getPlacementDrives().stream()
                .filter(d -> d.isPublished() && (d.getStatus() == DriveStatus.OPEN || d.getStatus() == DriveStatus.UPCOMING))
                .count()
            : 0;
        return mapper.toCompanyResponse(company, totalDrives, activeDrives);
    }
}
