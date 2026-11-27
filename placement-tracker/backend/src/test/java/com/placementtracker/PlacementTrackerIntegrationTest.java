package com.placementtracker;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.placementtracker.dto.request.*;
import com.placementtracker.entity.ApplicationStatus;
import com.placementtracker.entity.DriveStatus;
import com.placementtracker.entity.JobType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PlacementTrackerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String loginAndGetToken(String identifier, String password) throws Exception {
        LoginRequest req = new LoginRequest(identifier, password);
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isOk())
            .andReturn();
        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        return json.get("token").asText();
    }

    @Test
    void fullEndToEndWorkflowShouldSucceed() throws Exception {
        // 1. Health & Public Overview
        mockMvc.perform(get("/api/health"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("UP"));

        mockMvc.perform(get("/api/public/overview"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.totalCompanies").isNumber());

        // 2. Admin login & Authorization checks
        String adminToken = loginAndGetToken("admin", "Admin@123");
        mockMvc.perform(get("/api/dashboard/admin")
                .header("Authorization", "Bearer " + adminToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.totalStudents").isNumber());

        // 3. Register new student (always STUDENT role)
        RegisterRequest registerReq = new RegisterRequest(
            "Kavya Singh",
            "kavya.singh@abesec.ac.in",
            "Pass@1234",
            "Pass@1234",
            "2026CSE888",
            "CSE",
            "B",
            2026,
            "9876543219"
        );
        MvcResult regResult = mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerReq)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.role").value("STUDENT"))
            .andReturn();

        String studentToken = objectMapper.readTree(regResult.getResponse().getContentAsString()).get("token").asText();
        long studentId = objectMapper.readTree(regResult.getResponse().getContentAsString()).get("studentId").asLong();

        // 4. Student cannot access Admin endpoints
        mockMvc.perform(get("/api/admin/students")
                .header("Authorization", "Bearer " + studentToken))
            .andExpect(status().isForbidden());

        // 5. Student updates profile & uploads PDF resume
        StudentProfileRequest profileReq = new StudentProfileRequest(
            "Kavya Singh",
            "2026CSE888",
            "9876543219",
            "CSE",
            "B",
            2026,
            8.75,
            0,
            "Java, Spring Boot, React",
            null,
            "https://linkedin.com/in/kavya",
            "https://github.com/kavya",
            null
        );
        mockMvc.perform(put("/api/student/profile")
                .header("Authorization", "Bearer " + studentToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(profileReq)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.cgpa").value(8.75));

        byte[] pdfBytes = "%PDF-1.4\n1 0 obj\n<<>>\nendobj\n".getBytes(StandardCharsets.US_ASCII);
        MockMultipartFile resumeFile = new MockMultipartFile("file", "kavya_resume.pdf", "application/pdf", pdfBytes);
        mockMvc.perform(multipart("/api/student/resume")
                .file(resumeFile)
                .header("Authorization", "Bearer " + studentToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.hasUploadedResume").value(true));

        mockMvc.perform(get("/api/students/" + studentId + "/resume")
                .header("Authorization", "Bearer " + studentToken))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_PDF));

        // 6. Admin creates Company & Placement Drive
        CompanyRequest companyReq = new CompanyRequest(
            "Atlassian India",
            "Enterprise SaaS",
            "https://atlassian.com",
            "Bengaluru",
            "Collaboration software",
            "campus@atlassian.com"
        );
        MvcResult compRes = mockMvc.perform(post("/api/companies")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(companyReq)))
            .andExpect(status().isCreated())
            .andReturn();
        long companyId = objectMapper.readTree(compRes.getResponse().getContentAsString()).get("id").asLong();

        PlacementDriveRequest driveReq = new PlacementDriveRequest(
            companyId,
            "Graduate Software Engineer",
            "Full-stack product engineering role.",
            JobType.FULL_TIME,
            "Bengaluru",
            22.0,
            8.0,
            0,
            "CSE,IT",
            2026,
            LocalDate.now().plusDays(10),
            LocalDate.now().plusDays(15),
            "Java, React",
            "OA -> Technical -> Values",
            DriveStatus.OPEN,
            true
        );
        MvcResult driveRes = mockMvc.perform(post("/api/drives")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(driveReq)))
            .andExpect(status().isCreated())
            .andReturn();
        long driveId = objectMapper.readTree(driveRes.getResponse().getContentAsString()).get("id").asLong();

        // 7. Student applies & duplicate application is rejected
        ApplicationCreateRequest applyReq = new ApplicationCreateRequest(driveId);
        MvcResult appRes = mockMvc.perform(post("/api/applications")
                .header("Authorization", "Bearer " + studentToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(applyReq)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.status").value("APPLIED"))
            .andReturn();
        long applicationId = objectMapper.readTree(appRes.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(post("/api/applications")
                .header("Authorization", "Bearer " + studentToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(applyReq)))
            .andExpect(status().isConflict());

        // 8. Admin updates application status and history is recorded
        ApplicationStatusUpdateRequest statusReq = new ApplicationStatusUpdateRequest(
            ApplicationStatus.SELECTED,
            "Offer extended"
        );
        mockMvc.perform(put("/api/applications/" + applicationId + "/status")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(statusReq)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("SELECTED"))
            .andExpect(jsonPath("$.statusHistory.length()").value(2));

        // 9. Logout revokes token
        mockMvc.perform(post("/api/auth/logout")
                .header("Authorization", "Bearer " + studentToken))
            .andExpect(status().isOk());

        mockMvc.perform(get("/api/student/profile")
                .header("Authorization", "Bearer " + studentToken))
            .andExpect(status().isUnauthorized());
    }
}
