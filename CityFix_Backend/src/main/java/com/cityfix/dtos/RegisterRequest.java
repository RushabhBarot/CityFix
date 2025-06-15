package com.cityfix.dtos;
import com.cityfix.entity.enums.Role;
import lombok.*;

@Data
public class RegisterRequest {
    private String fullName;
    private String email;
    private String password;
    private Role role;
}