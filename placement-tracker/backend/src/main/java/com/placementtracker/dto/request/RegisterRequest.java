package com.placementtracker.dto.request;

import jakarta.validation.constraints.*;

public record RegisterRequest(
    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 120, message = "Full name must be between 2 and 120 characters")
    String fullName,

    @NotBlank(message = "College email is required")
    @Email(message = "Please enter a valid email address")
    String email,

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100, message = "Password must be at least 6 characters")
    String password,

    @NotBlank(message = "Confirm password is required")
    String confirmPassword,

    @NotBlank(message = "Enrollment number is required")
    @Size(min = 4, max = 40, message = "Enrollment number must be between 4 and 40 characters")
    String enrollmentNumber,

    @NotBlank(message = "Branch is required")
    String branch,

    @NotBlank(message = "Section is required")
    @Size(max = 20, message = "Section must be at most 20 characters")
    String section,

    @NotNull(message = "Passing year is required")
    @Min(value = 2020, message = "Passing year must be 2020 or later")
    @Max(value = 2035, message = "Passing year must be 2035 or earlier")
    Integer passingYear,

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9+\\-\\s]{10,15}$", message = "Please enter a valid 10-15 digit phone number")
    String phoneNumber
) {}
