package com.cityfix.controller;

import com.cityfix.entity.User;
import com.cityfix.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // 1. Get current user profile (accessible to any logged-in user)
    @GetMapping("/profile/{id}")
    public ResponseEntity<User> getProfile(@PathVariable String id) throws ChangeSetPersister.NotFoundException {
        return ResponseEntity.ok(userService.getProfile(id));
    }

    // 2. Get all workers who are pending approval (admin-only)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/pending-workers")
    public ResponseEntity<List<User>> getAllPendingWorkers() {
        return ResponseEntity.ok(userService.getAllPendingWorkers());
    }

    // 3. Approve a worker by ID (admin-only)
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/approve-worker/{id}")
    public ResponseEntity<User> approveWorker(@PathVariable String id) {
        return ResponseEntity.ok(userService.approveWorker(id));
    }
}

