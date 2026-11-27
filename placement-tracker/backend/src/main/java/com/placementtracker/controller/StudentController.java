package com.placementtracker.controller;

import com.placementtracker.dto.request.StudentProfileRequest;
import com.placementtracker.dto.response.StudentResponse;
import com.placementtracker.entity.Student;
import com.placementtracker.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping("/student/profile")
    public ResponseEntity<StudentResponse> getProfile() {
        return ResponseEntity.ok(studentService.getCurrentStudentProfile());
    }

    @PutMapping("/student/profile")
    public ResponseEntity<StudentResponse> updateProfile(@Valid @RequestBody StudentProfileRequest request) {
        return ResponseEntity.ok(studentService.updateCurrentStudentProfile(request));
    }

    @PostMapping(value = "/student/resume", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<StudentResponse> uploadResume(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(studentService.uploadCurrentStudentResume(file));
    }

    @GetMapping("/students/{id}/resume")
    public ResponseEntity<byte[]> downloadResume(@PathVariable Long id) {
        Student student = studentService.getStudentResumeForDownload(id);
        String fileName = student.getResumeFileName() != null ? student.getResumeFileName() : "resume.pdf";
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName.replace("\"", "") + "\"")
            .contentType(MediaType.APPLICATION_PDF)
            .body(student.getResumeData());
    }
}
