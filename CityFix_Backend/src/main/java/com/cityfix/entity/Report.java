package com.cityfix.entity;

import com.cityfix.entity.enums.Department;
import com.cityfix.entity.enums.ReportStatus;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "reports")
public class Report {
    @Id
    private String id;

    private String description;
    private String location;      // e.g., address
    private double latitude;
    private double longitude;

    private ReportStatus status;
    private Department department;

    private String citizenId;
    private String assignedWorkerId;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime completedAt;

    //Photos
    private String beforePhotoUrl;  // Uploaded by citizen
    private String afterPhotoUrl;   // Uploaded by worker

    // Citizen verification & rating
    private boolean citizenVerified;
    private Integer rating;         // 1–5 stars, optional
}