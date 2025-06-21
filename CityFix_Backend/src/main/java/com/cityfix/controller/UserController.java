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
    @PreAuthorize("hasRole('USER')")
    @GetMapping("/citizen/profile/{id}")
    public ResponseEntity<User> getCitizenProfile(@PathVariable String id) throws ChangeSetPersister.NotFoundException {
        return ResponseEntity.ok(userService.getProfile(id));
    }

    @PreAuthorize("hasRole('WORKER')")
    @GetMapping("/worker/profile/{id}")
    public ResponseEntity<User> getWorkerProfile(@PathVariable String id) throws ChangeSetPersister.NotFoundException {
        return ResponseEntity.ok(userService.getProfile(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/profile/{id}")
    public ResponseEntity<User> getAdminProfile(@PathVariable String id) throws ChangeSetPersister.NotFoundException {
        return ResponseEntity.ok(userService.getProfile(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/pending-workers")
    public ResponseEntity<List<User>> getAllPendingWorkers() {
        return ResponseEntity.ok(userService.getAllPendingWorkers());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/approve-worker/{id}")
    public ResponseEntity<User> approveWorker(@PathVariable String id) {
        return ResponseEntity.ok(userService.approveWorker(id));
    }

    @GetMapping("/admin/active-workers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getActiveWorkersByDepartment(@RequestParam String department) {
        return ResponseEntity.ok(userService.getActiveWorkersByDepartment(department));
    }


}
