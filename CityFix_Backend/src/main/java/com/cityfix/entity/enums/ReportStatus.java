package com.cityfix.entity.enums;

public enum ReportStatus {
    PENDING,         // Initial state
    ASSIGNED,        // Assigned to worker
    IN_PROGRESS,     // Worker accepted the task
    COMPLETED        // Marked completed by worker
}
