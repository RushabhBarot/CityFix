package com.cityfix.service;

import com.cityfix.dtos.ReportFilterDTO;
import com.cityfix.dtos.ReportRequestDTO;
import com.cityfix.dtos.ReportUpdateDTO;
import com.cityfix.entity.Report;
import com.cityfix.entity.enums.ReportStatus;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ReportService {
    Report createReport(ReportRequestDTO dto, String citizenId);
    List<Report> getMyReports(String citizenId);
    Report updateReport(String reportId, ReportUpdateDTO dto, String citizenId);
    void deleteReport(String reportId, String citizenId);
    List<Report> getReportsAssignedToWorker(String workerId , ReportStatus status);
    Report updateStatus(String reportId, ReportStatus status, String remarks, MultipartFile afterPhoto);
    List<Report> getAllReports(ReportFilterDTO filter);
    Report assignReport(String reportId, String workerId);
}
