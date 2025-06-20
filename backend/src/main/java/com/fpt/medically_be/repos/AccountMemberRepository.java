package com.fpt.medically_be.repos;

import com.fpt.medically_be.entity.AccountMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.lang.reflect.Member;

@Repository
public interface AccountMemberRepository extends JpaRepository<AccountMember, String> {
    // Các phương thức tùy chỉnh nếu cần
}
