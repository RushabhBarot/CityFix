package com.cityfix.dtos;

import com.cityfix.entity.enums.Department;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class ReportRequestDTO {
    private String description;
    private String location;
    private double latitude;
    private double longitude;
    private Department department;
    private MultipartFile beforePhoto;
}
