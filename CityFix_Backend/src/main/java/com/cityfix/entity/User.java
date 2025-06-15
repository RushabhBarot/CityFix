package com.cityfix.entity;

import com.cityfix.entity.enums.Role;
import jakarta.persistence.*;
import lombok.*;

    @Entity
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Table(name = "users")
    public class User {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        private String fullName;

        @Column(unique = true)
        private String email;

        private String password;

        @Enumerated(EnumType.STRING)
        private Role role;
}
