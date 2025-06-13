//package com.fpt.medically_be.entity;
//
//import jakarta.persistence.*;
//import lombok.AllArgsConstructor;
//import lombok.Data;
//import lombok.NoArgsConstructor;
//
//import java.time.LocalDateTime;
//import java.util.List;
//
//@Entity
//@Table(name = "health_articles")
//@Data
//@AllArgsConstructor
//@NoArgsConstructor
//public class HealthArticle {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @Column(nullable = false)
//    private String title;
//
//    @Column(nullable = false, columnDefinition = "NVARCHAR(MAX)")
//    private String summary;
//
//    @Column(nullable = false, columnDefinition = "NVARCHAR(MAX)")
//    private String content;
//
//    @ManyToOne
//    @JoinColumn(name = "author_id")
//    private User author;
//
//    @Column(nullable = false)
//    private LocalDateTime createdAt;
//
//    private LocalDateTime updatedAt;
//
//    @Column(nullable = false)
//    private String category;
//
//    private String imageUrl;
//
//    @ElementCollection
//    @CollectionTable(name = "health_article_tags", joinColumns = @JoinColumn(name = "article_id"))
//    @Column(name = "tag")
//    private List<String> tags;
//
//    @Column(nullable = false)
//    private boolean published = false;
//}
