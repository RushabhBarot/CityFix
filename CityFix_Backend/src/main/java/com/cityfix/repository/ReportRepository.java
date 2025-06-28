package com.cityfix.repository;

import com.cityfix.entity.Report;
import com.cityfix.entity.enums.ReportStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends MongoRepository<Report,String> {

    List<Report> findByCitizenId(String citizenId);

    List<Report> findByAssignedWorkerId(String workerId);
    List<Report> findByAssignedWorkerIdAndStatus(String workerId, ReportStatus status);
    
    long countByStatus(ReportStatus status);

}
