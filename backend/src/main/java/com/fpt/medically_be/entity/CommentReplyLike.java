package com.fpt.medically_be.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "comment_reply_likes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"reply_id", "user_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentReplyLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "reply_id", nullable = false)
    private CommentReply reply;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private AccountMember user;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
