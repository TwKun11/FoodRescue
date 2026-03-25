package com.foodrescue.foodrescue_be.repository;

import com.foodrescue.foodrescue_be.model.ViolationReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ViolationReportRepository extends JpaRepository<ViolationReport, Long> {

        long countByStatus(ViolationReport.Status status);

        long countByType(ViolationReport.ReportType type);

        @Query(value = """
                        SELECT AVG(TIMESTAMPDIFF(HOUR, vr.created_at, vr.resolved_at))
                        FROM violation_reports vr
                        WHERE vr.resolved_at IS NOT NULL
                        """, nativeQuery = true)
        Double getAverageResolutionHours();

        @Query(value = """
                        SELECT
                                s.id AS sellerId,
                                s.shop_name AS sellerName,
                                COUNT(vr.id) AS totalReports,
                                SUM(CASE WHEN vr.status IN ('PENDING', 'IN_REVIEW') THEN 1 ELSE 0 END) AS openReports,
                                SUM(CASE WHEN vr.status = 'RESOLVED' THEN 1 ELSE 0 END) AS resolvedReports
                        FROM violation_reports vr
                        JOIN products p ON p.id = vr.product_id
                        JOIN sellers s ON s.id = p.seller_id
                        GROUP BY s.id, s.shop_name
                        ORDER BY totalReports DESC, openReports DESC
                        LIMIT :limit
                        """, nativeQuery = true)
        java.util.List<Object[]> getTopSellerIssues(@Param("limit") int limit);

    @EntityGraph(attributePaths = {"reporter", "product", "review"})
    @Query("""
            SELECT vr FROM ViolationReport vr
            JOIN vr.reporter rp
            JOIN vr.product p
            WHERE (:search IS NULL OR :search = ''
                OR LOWER(COALESCE(vr.description, '')) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(COALESCE(rp.email, '')) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(COALESCE(rp.fullName, '')) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(COALESCE(p.name, '')) LIKE LOWER(CONCAT('%', :search, '%')))
              AND (:type IS NULL OR vr.type = :type)
              AND (:status IS NULL OR vr.status = :status)
            ORDER BY vr.createdAt DESC
            """)
    Page<ViolationReport> findAllForAdmin(
            @Param("search") String search,
            @Param("type") ViolationReport.ReportType type,
            @Param("status") ViolationReport.Status status,
            Pageable pageable
    );

    @EntityGraph(attributePaths = {"reporter", "product", "review"})
    Page<ViolationReport> findByReporterIdOrderByCreatedAtDesc(Long reporterId, Pageable pageable);
}
