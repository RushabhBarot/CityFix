package com.cityfix.controller;

import com.cityfix.dtos.ReportFilterDTO;
import com.cityfix.dtos.ReportRequestDTO;
import com.cityfix.dtos.ReportUpdateDTO;
import com.cityfix.entity.Report;
import com.cityfix.entity.enums.Department;
import com.cityfix.entity.enums.ReportStatus;
import com.cityfix.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@CrossOrigin("http://localhost:5173")
@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    // --- CITIZEN ---

    @PostMapping("/citizen/create")

    public ResponseEntity<Report> createReport(
            @ModelAttribute ReportRequestDTO reportDTO,
            @RequestParam String citizenId) {
        return ResponseEntity.ok(reportService.createReport(reportDTO, citizenId));
    }

    @GetMapping("/citizen/me")

    public ResponseEntity<List<Report>> getMyReports(@RequestParam String citizenId) {
        return ResponseEntity.ok(reportService.getMyReports(citizenId));
    }

    @PutMapping("/citizen/update-report")

    public ResponseEntity<Report> updateReport(
            @RequestParam String reportId,
            @RequestBody ReportUpdateDTO dto,
            @RequestParam String citizenId) {
        return ResponseEntity.ok(reportService.updateReport(reportId, dto, citizenId));
    }

    @DeleteMapping("/citizen")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> deleteReport(@RequestParam String reportId,
                                             @RequestParam String citizenId) {
        reportService.deleteReport(reportId, citizenId);
        return ResponseEntity.noContent().build();
    }

    // --- WORKER ---

    @GetMapping("/worker/assigned")
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<List<Report>> getAssignedReports(@RequestParam String workerId,
                                                           @RequestParam(required = false) ReportStatus status) {
        return ResponseEntity.ok(reportService.getReportsAssignedToWorker(workerId, status));
    }


    @PutMapping("/worker/update_status")

    public ResponseEntity<Report> updateReportStatus(
            @RequestParam String reportId,
            @RequestParam ReportStatus status,
            @RequestParam(required = false) MultipartFile afterPhoto) {
        return ResponseEntity.ok(reportService.updateStatus(reportId, status, afterPhoto));
    }

    // --- ADMIN ---

    @GetMapping("/admin/all-reports")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Report>> getAllReports( @RequestParam(required = false) ReportStatus status,
                                                       @RequestParam(required = false) Department department,
                                                       @RequestParam(required = false) String citizenId,
                                                       @RequestParam(required = false) String assignedWorkerId,
                                                       @RequestParam(required = false) Boolean verified)
    {

        ReportFilterDTO filter = new ReportFilterDTO();
        filter.setStatus(status);
        filter.setDepartment(department);
        filter.setCitizenId(citizenId);
        filter.setAssignedWorkerId(assignedWorkerId);
        filter.setVerified(verified);

        return ResponseEntity.ok(reportService.getAllReports(filter));
    }

    @PostMapping("/admin/assign-reports")

    public ResponseEntity<Report> assignReport(@RequestParam String reportId,
                                               @RequestParam String workerId) {
        return ResponseEntity.ok(reportService.assignReport(reportId, workerId));
    }
}
