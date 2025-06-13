//package com.fpt.medically_be.entity;
//
//import jakarta.persistence.*;
//import lombok.AllArgsConstructor;
//import lombok.Data;
//import lombok.NoArgsConstructor;
//
//import java.time.LocalDateTime;
//
//@Entity
//@Table(name = "comments")
//@Data
//@AllArgsConstructor
//@NoArgsConstructor
//public class Comment {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @Column(nullable = false, columnDefinition = "NVARCHAR(MAX)")
//    private String content;
//
//    @ManyToOne
//    @JoinColumn(name = "author_id", nullable = false)
//    private User author;
//
//    @ManyToOne
//    @JoinColumn(name = "post_id", nullable = false)
//    private CommunityPost post;
//
//    @Column(nullable = false)
//    private LocalDateTime createdAt;
//
//    private int likes = 0;
//
//    private boolean isPinned = false;
//}
