package com.cityfix.service.impl;

import com.cityfix.dtos.ReportFilterDTO;
import com.cityfix.dtos.ReportRequestDTO;
import com.cityfix.dtos.ReportUpdateDTO;
import com.cityfix.entity.Report;
import com.cityfix.entity.enums.ReportStatus;
import com.cityfix.repository.ReportRepository;
import com.cityfix.service.FileStorageService;
import com.cityfix.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final ReportRepository reportRepository;
    private final FileStorageService fileStorageService;

    @Override
    public Report createReport(ReportRequestDTO dto, String citizenId) {

        String photoUrl = fileStorageService.uploadFileAndGetUrl(dto.getBeforePhoto());

        Report report = Report.builder()
                .description(dto.getDescription())
                .location(dto.getLocation())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .status(ReportStatus.PENDING)
                .department(dto.getDepartment())
                .citizenId(citizenId)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .beforePhotoUrl(photoUrl)
                .build();
        return reportRepository.save(report);
    }

    @Override
    public List<Report> getMyReports(String citizenId) {
        return reportRepository.findByCitizenId(citizenId);
    }

    @Override
    public Report updateReport(String reportId, ReportUpdateDTO dto, String citizenId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        if (!report.getCitizenId().equals(citizenId)) {
            throw new RuntimeException("Unauthorized to update this report");
        }

        if (dto.getRating() != null) report.setRating(dto.getRating());
        if (dto.isCitizenVerified()) report.setCitizenVerified(true);
        if (dto.getStatus() != null) report.setStatus(dto.getStatus());
        if (dto.getAfterPhotoUrl() != null) report.setAfterPhotoUrl(dto.getAfterPhotoUrl());
        if (dto.getCompletedAt() != null) report.setCompletedAt(dto.getCompletedAt());

        report.setUpdatedAt(LocalDateTime.now());
        return reportRepository.save(report);
    }

    @Override
    public void deleteReport(String reportId, String citizenId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        if (!report.getCitizenId().equals(citizenId)) {
            throw new RuntimeException("Unauthorized to delete this report");
        }

        reportRepository.delete(report);
    }

    public List<Report> getReportsAssignedToWorker(String workerId, ReportStatus status) {
        if (status == null) {
            // return all reports assigned to this worker
            return reportRepository.findByAssignedWorkerId(workerId);
        } else {
            // return filtered reports based on status
            return reportRepository.findByAssignedWorkerIdAndStatus(workerId, status);
        }
    }


    @Override
    public Report updateStatus(String reportId, ReportStatus status,MultipartFile afterPhoto) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        report.setStatus(status);
        report.setUpdatedAt(LocalDateTime.now());

        if (status == ReportStatus.COMPLETED) {
            report.setCompletedAt(LocalDateTime.now());
        }

        if (afterPhoto != null && !afterPhoto.isEmpty()) {
            // Save image to storage and get URL (mocked here)
            String url = fileStorageService.uploadFileAndGetUrl(afterPhoto);;
            report.setAfterPhotoUrl(url);
        }

        return reportRepository.save(report);
    }

    @Override
    public List<Report> getAllReports(ReportFilterDTO filter) {
        // Simplified filtering — use Criteria or QueryDSL for complex conditions in real case
        return reportRepository.findAll().stream()
                .filter(r -> filter.getStatus() == null || r.getStatus() == filter.getStatus())
                .filter(r -> filter.getDepartment() == null || r.getDepartment() == filter.getDepartment())
                .filter(r -> filter.getCitizenId() == null || r.getCitizenId().equals(filter.getCitizenId()))
                .filter(r -> filter.getAssignedWorkerId() == null ||
                        (r.getAssignedWorkerId() != null && r.getAssignedWorkerId().equals(filter.getAssignedWorkerId())))
                .filter(r -> filter.getVerified() == null || r.isCitizenVerified() == filter.getVerified())
                .toList();
    }

    @Override
    public Report assignReport(String reportId, String workerId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        if (report.getAssignedWorkerId() != null) {
            throw new RuntimeException("Report already assigned");
        }

        report.setAssignedWorkerId(workerId);
        report.setStatus(ReportStatus.ASSIGNED);
        report.setUpdatedAt(LocalDateTime.now());

        return reportRepository.save(report);
    }



}
