package com.fpt.medically_be.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "health_articles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthArticle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "NVARCHAR(255)")
    private String title;

    @Column(nullable = false, columnDefinition = "NVARCHAR(500)")
    private String summary;

    @Column(nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String content;

    @Column(columnDefinition = "NVARCHAR(100)")
    private String author;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "member_id")
    private AccountMember member;

    @Column(nullable = false)
    private LocalDateTime publishDate;

    @Column(nullable = false, columnDefinition = "NVARCHAR(50)")
    private String category;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String imageUrl;

    @ElementCollection
    @CollectionTable(name = "health_article_tags", joinColumns = @JoinColumn(name = "article_id"))
    @Column(name = "tag", columnDefinition = "NVARCHAR(50)")
    private List<String> tags;

    private Boolean isActive = true;
}
