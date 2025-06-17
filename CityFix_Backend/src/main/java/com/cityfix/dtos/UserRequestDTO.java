package com.cityfix.dtos;
import com.cityfix.entity.enums.Department;
import com.cityfix.entity.enums.Role;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

@Data
public class UserRequestDTO {
    private String name;
    private String email;
    private String password;
    private Role role;
    private String mobileNumber;
    private Department department;
    private MultipartFile profilePhoto;
    private MultipartFile idCard;
}