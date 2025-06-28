package com.cityfix.service.impl;

import com.cityfix.entity.enums.Role;
import com.cityfix.entity.enums.ReportStatus;
import com.cityfix.repository.ReportRepository;
import com.cityfix.repository.UserRepository;
import com.cityfix.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StatsServiceImpl implements StatsService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;

    @Override
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Total reports filed
        long totalReports = reportRepository.count();
        System.out.println("Total reports in database: " + totalReports);
        stats.put("totalReports", totalReports);
        
        // Issues resolved (completed reports)
        long resolvedReports = reportRepository.countByStatus(ReportStatus.COMPLETED);
        System.out.println("Completed reports in database: " + resolvedReports);
        stats.put("resolvedReports", resolvedReports);
        
        // Active workers (approved workers)
        long activeWorkers = userRepository.countByRoleAndActive(Role.WORKER, true);
        System.out.println("Active workers in database: " + activeWorkers);
        stats.put("activeWorkers", activeWorkers);
        
        // Total departments (from the actual enum)
        int totalDepartments = 3; // WASTE_MANAGEMENT, PARKING_ENFORCEMENT, ROAD_MAINTENANCE
        System.out.println("Total departments: " + totalDepartments);
        stats.put("totalDepartments", totalDepartments);
        
        System.out.println("Final stats: " + stats);
        return stats;
    }
} 