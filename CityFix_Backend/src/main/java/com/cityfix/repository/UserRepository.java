package com.cityfix.repository;


import com.cityfix.entity.User;
import com.cityfix.entity.enums.Role;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String adminEmail);

    List<User> findByRoleAndActive(Role role, boolean b);

    List<User> findByRoleAndActiveAndDepartment(Role role, boolean active, String department);
}