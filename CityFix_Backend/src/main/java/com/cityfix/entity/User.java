package com.cityfix.entity;

import com.cityfix.entity.enums.Role;
import com.cityfix.entity.enums.Department;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    private String id;

    private String name;
    private String email;
    private String password;

    private Role role; // ADMIN, CITIZEN, WORKER

    // Common to all
    private byte[] profilePhoto;; // URL or Base64
    private String location;     // Can be address string or lat-long

    // Specific to WORKER
    private Department department;  // e.g., SANITATION
    private int tasksCompleted;

    // Specific to CITIZEN
    private int totalReports;

    // For ADMIN and WORKER only
    private byte[] i_card; // file URL or base64 string
}
