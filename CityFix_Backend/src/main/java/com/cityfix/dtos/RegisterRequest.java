package com.cityfix.dtos;
import com.cityfix.entity.enums.Department;
import com.cityfix.entity.enums.Role;
import lombok.*;

@Data
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private Role role;
    private String mobileNumber;
    private byte[] avatarUrl;
    private boolean active;
    //worker specific
    private Department department;
    private byte[] idCardUrl;
}