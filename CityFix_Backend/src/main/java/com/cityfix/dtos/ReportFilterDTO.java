package com.cityfix.dtos;
import com.cityfix.entity.enums.Department;
import com.cityfix.entity.enums.ReportStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportFilterDTO {
    private ReportStatus status;     // Optional: PENDING, COMPLETED, etc.
    private Department department;   // Optional: WASTE, ROAD, etc.
    private String citizenId;        // Optional: for My Reports
    private String assignedWorkerId; // Optional: for worker dashboard
    private Boolean verified;        // Optional: whether verified by citizen
}