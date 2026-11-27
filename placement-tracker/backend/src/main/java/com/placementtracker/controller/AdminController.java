package com.placementtracker.controller;

import com.placementtracker.dto.request.AdminCreateStudentRequest;
import com.placementtracker.dto.request.StudentProfileRequest;
import com.placementtracker.dto.response.StudentResponse;
import com.placementtracker.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/students")
public class AdminController {

    private final StudentService studentService;

    public AdminController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping
    public ResponseEntity<List<StudentResponse>> listStudents(
        @RequestParam(required = false) String search,
        @RequestParam(required = false) String branch,
        @RequestParam(required = false) Integer passingYear
    ) {
        return ResponseEntity.ok(studentService.searchStudents(search, branch, passingYear));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentResponse> getStudent(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getStudentById(id));
    }

    @PostMapping
    public ResponseEntity<StudentResponse> createStudent(@Valid @RequestBody AdminCreateStudentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(studentService.createStudentByAdmin(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudentResponse> updateStudent(
        @PathVariable Long id,
        @Valid @RequestBody StudentProfileRequest request
    ) {
        return ResponseEntity.ok(studentService.updateStudentByAdmin(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<StudentResponse> toggleActive(
        @PathVariable Long id,
        @RequestParam boolean active
    ) {
        return ResponseEntity.ok(studentService.toggleStudentActive(id, active));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.ok(Map.of("message", "Student deleted successfully"));
    }
}
