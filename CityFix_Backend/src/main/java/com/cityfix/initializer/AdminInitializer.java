package com.cityfix.initializer;

import com.cityfix.entity.User;
import com.cityfix.entity.enums.Role;
import com.cityfix.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        String adminEmail = "admin@cityfix.com";

        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = User.builder()
                    .name("CityFix Admin")
                    .email(adminEmail)
                    .password(passwordEncoder.encode("Admin@123")) // strong password
                    .role(Role.ADMIN)
                    .active(true)
                    .build();

            userRepository.save(admin);
            System.out.println("Default admin created: " + adminEmail);
        }
    }
}