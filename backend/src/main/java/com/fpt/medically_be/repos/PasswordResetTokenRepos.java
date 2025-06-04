package com.fpt.medically_be.repos;

import com.fpt.medically_be.entity.PasswordResetToken;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface PasswordResetTokenRepos extends JpaRepository<PasswordResetToken, Integer> {
    Optional<PasswordResetToken> findByToken(String token);
  @Transactional
  @Modifying
  @Query("DELETE FROM PasswordResetToken p WHERE p.accountMember.id = :memberId")  // Use custom query
    void deleteByAccountMemberId(@Param("memberId") String memberId);
}
