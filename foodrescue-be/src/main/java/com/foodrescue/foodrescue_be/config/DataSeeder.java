package com.foodrescue.foodrescue_be.config;

import com.foodrescue.foodrescue_be.model.Role;
import com.foodrescue.foodrescue_be.model.Seller;
import com.foodrescue.foodrescue_be.model.User;
import com.foodrescue.foodrescue_be.model.UserStatus;
import com.foodrescue.foodrescue_be.repository.SellerRepository;
import com.foodrescue.foodrescue_be.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final SellerRepository sellerRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        seedAdmin();
        seedSeller();
    }

    private void seedAdmin() {
        String email = "admin@foodrescue.vn";
        if (userRepository.existsByEmail(email)) return;

        User admin = User.builder()
                .email(email)
                .password(passwordEncoder.encode("Admin@123"))
                .fullName("Quản trị viên")
                .role(Role.ADMIN)
                .status(UserStatus.ACTIVE)
                .build();
        userRepository.save(admin);
        log.info("Seeded admin account: {}", email);
    }

    private void seedSeller() {
        String email = "seller@foodrescue.vn";
        if (userRepository.existsByEmail(email)) return;

        User sellerUser = User.builder()
                .email(email)
                .password(passwordEncoder.encode("Seller@123"))
                .fullName("Cửa hàng Demo")
                .role(Role.SELLER)
                .status(UserStatus.ACTIVE)
                .build();
        sellerUser = userRepository.save(sellerUser);

        Seller seller = Seller.builder()
                .user(sellerUser)
                .code("SELLER001")
                .shopName("Cửa hàng Demo FoodRescue")
                .shopSlug("demo-foodrescue")
                .contactName("Cửa hàng Demo")
                .phone("0901234567")
                .commissionRate(java.math.BigDecimal.ZERO)
                .status(Seller.Status.active)
                .isVerified(true)
                .build();
        sellerRepository.save(seller);
        log.info("Seeded seller account: {}", email);
    }
}
