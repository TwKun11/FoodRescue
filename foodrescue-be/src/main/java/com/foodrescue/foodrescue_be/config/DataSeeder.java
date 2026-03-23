package com.foodrescue.foodrescue_be.config;

import com.foodrescue.foodrescue_be.model.BannerAd;
import com.foodrescue.foodrescue_be.model.Role;
import com.foodrescue.foodrescue_be.model.Seller;
import com.foodrescue.foodrescue_be.model.User;
import com.foodrescue.foodrescue_be.model.UserStatus;
import com.foodrescue.foodrescue_be.repository.BannerAdRepository;
import com.foodrescue.foodrescue_be.repository.SellerRepository;
import com.foodrescue.foodrescue_be.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@Profile("!test")
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final SellerRepository sellerRepository;
    private final BannerAdRepository bannerAdRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        seedAdmin();
        seedSeller();
        seedBannerAds();
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

    /** Seed banner ads: 4 APPROVED (carousel) + 3 PENDING (admin chờ duyệt). */
    private void seedBannerAds() {
        if (bannerAdRepository.count() > 0) return;

        List<Seller> sellers = sellerRepository.findAll();
        if (sellers.isEmpty()) return;
        Long sellerId = sellers.get(0).getId();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = now.minusDays(1);
        LocalDateTime end = now.plusMonths(2);

        List<BannerAd> approved = List.of(
                BannerAd.builder()
                        .sellerId(sellerId)
                        .title("Rau củ tươi – Giảm đến 50%")
                        .imageUrl("https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=80")
                        .linkUrl("/products")
                        .status(BannerAd.Status.APPROVED)
                        .startDate(start)
                        .endDate(end)
                        .build(),
                BannerAd.builder()
                        .sellerId(sellerId)
                        .title("Bánh mì mới ra lò – Deal sáng")
                        .imageUrl("https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&q=80")
                        .linkUrl("/products")
                        .status(BannerAd.Status.APPROVED)
                        .startDate(start)
                        .endDate(end)
                        .build(),
                BannerAd.builder()
                        .sellerId(sellerId)
                        .title("Trái cây tươi – Giải cứu thực phẩm")
                        .imageUrl("https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200&q=80")
                        .linkUrl("/products")
                        .status(BannerAd.Status.APPROVED)
                        .startDate(start)
                        .endDate(end)
                        .build(),
                BannerAd.builder()
                        .sellerId(sellerId)
                        .title("Bữa ăn sẵn – Giá sốc cuối ngày")
                        .imageUrl("https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80")
                        .linkUrl("/products")
                        .status(BannerAd.Status.APPROVED)
                        .startDate(start)
                        .endDate(end)
                        .build()
        );
        List<BannerAd> pending = List.of(
                BannerAd.builder()
                        .sellerId(sellerId)
                        .title("Combo sữa tươi – Ưu đãi cuối tuần")
                        .imageUrl("https://images.unsplash.com/photo-1550583724-b2692b85b150?w=1200&q=80")
                        .linkUrl("/products")
                        .status(BannerAd.Status.PENDING)
                        .startDate(start)
                        .endDate(end)
                        .build(),
                BannerAd.builder()
                        .sellerId(sellerId)
                        .title("Thực phẩm tươi sống – Giao nhanh 2h")
                        .imageUrl("https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1200&q=80")
                        .linkUrl("/products")
                        .status(BannerAd.Status.PENDING)
                        .startDate(start)
                        .endDate(end)
                        .build(),
                BannerAd.builder()
                        .sellerId(sellerId)
                        .title("Đồ đông lạnh – Giảm đến 40%")
                        .imageUrl("https://images.unsplash.com/photo-1584568694245-b9f1c0b2c92a?w=1200&q=80")
                        .linkUrl("/products")
                        .status(BannerAd.Status.PENDING)
                        .startDate(start)
                        .endDate(end)
                        .build()
        );
        bannerAdRepository.saveAll(approved);
        bannerAdRepository.saveAll(pending);
        log.info("Seeded {} approved + {} pending banner ads", approved.size(), pending.size());
    }
}
