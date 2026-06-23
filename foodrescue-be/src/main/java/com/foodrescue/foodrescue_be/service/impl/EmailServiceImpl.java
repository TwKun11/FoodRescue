package com.foodrescue.foodrescue_be.service.impl;

import com.foodrescue.foodrescue_be.service.EmailService;
import com.foodrescue.foodrescue_be.model.Seller;
import com.foodrescue.foodrescue_be.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    @Value("${app.verification.base-url:http://localhost:3000/verify-email}")
    private String baseUrl;

    @Value("${app.reset-password.base-url:http://localhost:3000/reset-password}")
    private String resetPasswordBaseUrl;

    @Value("${app.frontend.base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    @Value("${MAIL_FROM:${MAIL_USERNAME:}}")
    private String mailFrom;

    private final JavaMailSender mailSender;

    @Override
    public void sendVerificationEmail(String email, String verificationToken) {
        String link = baseUrl + "?token=" + verificationToken;
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Xac thuc email - FoodRescue");
            message.setText("Chao ban,\n\nVui long bam vao link sau de xac thuc tai khoan:\n" + link + "\n\nLink co hieu luc trong 24 gio.");
            if (mailFrom != null && !mailFrom.isBlank()) {
                message.setFrom(mailFrom);
            }
            mailSender.send(message);
            log.info("Verification email sent to {}", email);
        } catch (Exception e) {
            log.error("Failed to send verification email to {}", email, e);
            throw new RuntimeException("Không thể gửi email. Vui lòng thử lại sau.");
        }
    }

    @Override
    public void sendPasswordResetEmail(String email, String resetToken) {
        String link = resetPasswordBaseUrl + "?token=" + resetToken;
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Đặt lại mật khẩu - FoodRescue");
            message.setText("Chào bạn,\n\nBạn đã yêu cầu đặt lại mật khẩu. Vui lòng bấm vào link sau để tạo mật khẩu mới:\n" + link + "\n\nLink có hiệu lực trong 1 giờ. Nếu không phải bạn yêu cầu, hãy bỏ qua email này.");
            message.setFrom("nhybui2312@gmail.com");
            mailSender.send(message);
            log.info("Password reset email sent to {}", email);
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}", email, e);
            throw new RuntimeException("Không thể gửi email. Vui lòng thử lại sau.");
        }
    }
    @Override
    public void sendSellerApplicationApprovedEmail(User user, Seller seller) {
        String email = user != null ? user.getEmail() : null;
        if (email == null || email.isBlank()) {
            log.warn("Cannot send seller approval email because user email is missing for seller {}", seller != null ? seller.getId() : null);
            return;
        }

        String sellerName = firstNonBlank(
                seller != null ? seller.getContactName() : null,
                user != null ? user.getFullName() : null,
                email,
                "Nhà bán hàng"
        );
        String shopName = firstNonBlank(seller != null ? seller.getShopName() : null, "cửa hàng của bạn");
        String dashboardUrl = trimTrailingSlash(frontendBaseUrl) + "/store";

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setTo(email);
            helper.setSubject("Ho so nha ban hang FoodRescue cua ban da duoc phe duyet");
            if (mailFrom != null && !mailFrom.isBlank()) {
                helper.setFrom(mailFrom);
            }
            helper.setText(buildSellerApprovedEmailHtml(sellerName, shopName, dashboardUrl), true);
            mailSender.send(message);
            log.info("Seller approval email sent to {} for seller {}", email, seller != null ? seller.getId() : null);
        } catch (Exception e) {
            log.error("Failed to send seller approval email to {} for seller {}", email, seller != null ? seller.getId() : null, e);
        }
    }

    private String buildSellerApprovedEmailHtml(String sellerName, String shopName, String sellerDashboardUrl) {
        String safeSellerName = escapeHtml(sellerName);
        String safeShopName = escapeHtml(shopName);
        String safeDashboardUrl = escapeHtml(sellerDashboardUrl);

        return String.join("\n",
                "<!doctype html>",
                "<html lang=\"vi\">",
                "  <head>",
                "    <meta charset=\"UTF-8\" />",
                "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />",
                "    <title>Hồ sơ nhà bán hàng đã được phê duyệt</title>",
                "  </head>",
                "  <body style=\"margin:0;padding:0;background:#f3f7f4;font-family:Arial,Helvetica,sans-serif;color:#1f2937;\">",
                "    <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"background:#f3f7f4;padding:32px 12px;\">",
                "      <tr><td align=\"center\">",
                "        <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width:640px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #dbe7dd;\">",
                "          <tr><td style=\"background:#10b981;padding:28px 32px;text-align:center;\">",
                "            <h1 style=\"margin:0;color:#ffffff;font-size:26px;line-height:1.35;font-weight:800;\">Chúc mừng! Hồ sơ nhà bán hàng đã được phê duyệt</h1>",
                "            <p style=\"margin:10px 0 0;color:#ecfdf5;font-size:15px;\">FoodRescue rất vui được đồng hành cùng cửa hàng của bạn.</p>",
                "          </td></tr>",
                "          <tr><td style=\"padding:32px;\">",
                "            <p style=\"margin:0 0 16px;font-size:16px;line-height:1.7;\">Xin chào <strong>" + safeSellerName + "</strong>,</p>",
                "            <p style=\"margin:0 0 16px;font-size:16px;line-height:1.7;\">Hồ sơ đăng ký nhà bán hàng cho <strong>" + safeShopName + "</strong> đã được đội ngũ FoodRescue kiểm tra và phê duyệt thành công.</p>",
                "            <p style=\"margin:0 0 20px;font-size:16px;line-height:1.7;\">Từ bây giờ, bạn có thể truy cập kênh người bán để thiết lập gian hàng, đăng sản phẩm, cập nhật tồn kho và bắt đầu tiếp cận khách hàng trên FoodRescue.</p>",
                "            <div style=\"background:#ecfdf5;border:1px solid #bbf7d0;border-radius:14px;padding:18px 20px;margin:24px 0;\">",
                "              <p style=\"margin:0 0 10px;font-size:15px;font-weight:700;color:#065f46;\">Gợi ý bước tiếp theo</p>",
                "              <ul style=\"margin:0;padding-left:20px;color:#374151;font-size:15px;line-height:1.7;\">",
                "                <li>Đăng nhập lại hoặc cập nhật phiên đăng nhập để nhận quyền Seller mới.</li>",
                "                <li>Hoàn thiện thông tin cửa hàng, địa chỉ nhận/giao hàng và giờ hoạt động.</li>",
                "                <li>Đăng những sản phẩm đầu tiên với hình ảnh, giá bán và số lượng rõ ràng.</li>",
                "                <li>Kiểm tra quy trình xử lý đơn để đảm bảo trải nghiệm tốt cho khách hàng.</li>",
                "              </ul>",
                "            </div>",
                "            <div style=\"text-align:center;margin:30px 0;\"><a href=\"" + safeDashboardUrl + "\" style=\"display:inline-block;background:#10b981;color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;padding:14px 24px;border-radius:999px;\">Truy cập kênh người bán</a></div>",
                "            <p style=\"margin:0 0 16px;font-size:15px;line-height:1.7;color:#4b5563;\">Nếu nút trên không hoạt động, bạn có thể đăng nhập vào FoodRescue và chọn mục Kênh người bán trong tài khoản của mình.</p>",
                "            <p style=\"margin:24px 0 0;font-size:16px;line-height:1.7;\">Cảm ơn bạn đã chung tay cùng FoodRescue giảm lãng phí thực phẩm và mang những sản phẩm chất lượng đến gần hơn với khách hàng.</p>",
                "            <p style=\"margin:24px 0 0;font-size:16px;line-height:1.7;\">Trân trọng,<br /><strong>Đội ngũ FoodRescue</strong></p>",
                "          </td></tr>",
                "          <tr><td style=\"background:#f9fafb;padding:18px 32px;text-align:center;border-top:1px solid #e5e7eb;\">",
                "            <p style=\"margin:0;color:#6b7280;font-size:12px;line-height:1.6;\">Đây là email tự động từ FoodRescue. Vui lòng không trả lời trực tiếp email này.</p>",
                "          </td></tr>",
                "        </table>",
                "      </td></tr>",
                "    </table>",
                "  </body>",
                "</html>"
        );
    }

    private String firstNonBlank(String... values) {
        if (values == null) {
            return "";
        }
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value.trim();
            }
        }
        return "";
    }

    private String trimTrailingSlash(String value) {
        if (value == null || value.isBlank()) {
            return "http://localhost:3000";
        }
        return value.replaceAll("/+$", "");
    }

    private String escapeHtml(String value) {
        return HtmlUtils.htmlEscape(value == null ? "" : value, "UTF-8");
    }

}
