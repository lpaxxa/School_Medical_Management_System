package com.fpt.medically_be.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "posts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "NVARCHAR(255)")
    private String title;

    @Column(length = 500, columnDefinition = "NVARCHAR(MAX)", nullable = false)
    private String excerpt;

    @Column(columnDefinition = "NVARCHAR(MAX)", nullable = false)
    private String content;

    @Column(name = "category", columnDefinition = "NVARCHAR(500)")
    private String category;

    @ManyToOne
    @JoinColumn(name = "author_id", nullable = false)
    private AccountMember author;

    @Column(name = "is_pinned")
    private boolean isPinned;

    @ElementCollection
    @CollectionTable(name = "post_tags", joinColumns = @JoinColumn(name = "post_id"))
    @Column(name = "tag", columnDefinition = "NVARCHAR(50)")
    private Set<String> tags = new HashSet<>();

    @Column(name = "likes_count")
    private int likes;

    @Column(name = "comments_count")
    private int commentsCount;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
