package com.cityfix.service;

import com.cityfix.dtos.UserRequestDTO;
import com.cityfix.entity.User;
import org.springframework.data.crossstore.ChangeSetPersister;

import java.util.List;

public interface UserService {
    User getProfile(String email) throws ChangeSetPersister.NotFoundException;

    User getProfileByEmail(String email) throws ChangeSetPersister.NotFoundException;

    List<User> getAllPendingWorkers(); // for admin

    User approveWorker(String workerId);

    List<User> getUsersByRoleAndActive(com.cityfix.entity.enums.Role role, boolean active);

    List<User> getActiveWorkersByDepartment(String department);
}
