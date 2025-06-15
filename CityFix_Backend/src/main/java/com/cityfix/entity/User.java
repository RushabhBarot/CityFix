package com.cityfix.entity;

import com.cityfix.entity.enums.Role;
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
    private String id; // MongoDB uses String (ObjectId)

    private String fullName;

    private String email; // Ensure unique at the MongoDB level (via index)

    private String password;

    private Role role;
}
