package com.placementtracker.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CompanyRequest(
    @NotBlank(message = "Company name is required")
    @Size(max = 150)
    String name,

    @NotBlank(message = "Industry is required")
    @Size(max = 100)
    String industry,

    @Size(max = 300)
    String website,

    @NotBlank(message = "Location is required")
    @Size(max = 150)
    String location,

    @Size(max = 2000)
    String description,

    @NotBlank(message = "HR contact email is required")
    @Email(message = "Please provide a valid HR email")
    String hrContactEmail
) {}
