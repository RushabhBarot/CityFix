package com.cityfix.service.impl;

import com.cityfix.entity.User;
import com.cityfix.entity.enums.Role;
import com.cityfix.repository.UserRepository;
import com.cityfix.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepo;

    @Override
    public User getProfile(String email) throws ChangeSetPersister.NotFoundException {
        return userRepo.findById(email).orElseThrow(() -> new ChangeSetPersister.NotFoundException());
    }

    @Override
    public User getProfileByEmail(String email) throws ChangeSetPersister.NotFoundException {
        return userRepo.findByEmail(email).orElseThrow(() -> new ChangeSetPersister.NotFoundException());
    }

    @Override
    public List<User> getAllPendingWorkers() {
        return userRepo.findByRoleAndActive(Role.WORKER, false);
    }

    @Override
    public User approveWorker(String workerId) {
        User user = userRepo.findById(workerId).orElseThrow();

        if (user.getRole() != Role.WORKER) {
            throw new IllegalArgumentException("Only WORKER users can be approved.");
        }

        user.setActive(true);
        return userRepo.save(user);
    }

    @Override
    public List<User> getUsersByRoleAndActive(com.cityfix.entity.enums.Role role, boolean active) {
        return userRepo.findByRoleAndActive(role, active);
    }

    @Override
    public List<User> getActiveWorkersByDepartment(String department) {
        return userRepo.findByRoleAndActiveAndDepartment(Role.WORKER, true, department);
    }

}
