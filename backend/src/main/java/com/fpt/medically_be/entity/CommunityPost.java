//package com.fpt.medically_be.entity;
//
//import jakarta.persistence.*;
//import lombok.AllArgsConstructor;
//import lombok.Data;
//import lombok.NoArgsConstructor;
//
//import java.time.LocalDateTime;
//import java.util.ArrayList;
//import java.util.List;
//
//@Entity
//@Table(name = "community_posts")
//@Data
//@AllArgsConstructor
//@NoArgsConstructor
//public class CommunityPost {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @Column(nullable = false)
//    private String title;
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
//    @ElementCollection
//    @CollectionTable(name = "community_post_tags", joinColumns = @JoinColumn(name = "post_id"))
//    @Column(name = "tag")
//    private List<String> tags = new ArrayList<>();
//
//    private boolean isPinned = false;
//
//    private int likes = 0;
//
//    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
//    private List<Comment> comments = new ArrayList<>();
//
//    // Đếm comments để hiển thị trong danh sách
//    @Transient
//    public int getCommentsCount() {
//        return comments.size();
//    }
//}
