package com.cityfix.entity;

import com.cityfix.entity.enums.Role;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.cityfix.entity.enums.Department;

@Document(collection = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    private String id; // MongoDB uses String (ObjectId)

    private String name;

    private String email; // Ensure unique at the MongoDB level (via index)

    private String password;

    private Role role;

    private Department department;

    // Profile statistics
    private int totalReports;     // For citizen
    private int tasksCompleted;   // For worker
}
