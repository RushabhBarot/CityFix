package com.cityfix.dtos;

import com.cityfix.entity.enums.ReportStatus;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportUpdateDTO {
    private String reportId;

    private ReportStatus status;

    private String assignedWorkerId; // Optional, if reassignment is allowed

    private String afterPhotoUrl;    // Worker uploads this
    private LocalDateTime completedAt;

    private boolean citizenVerified; // Optional if citizen verifies it later
    private Integer rating;          // Optional rating
}