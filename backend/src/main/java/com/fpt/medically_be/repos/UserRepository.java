package com.fpt.medically_be.repos;

import com.fpt.medically_be.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository để truy vấn thông tin người dùng từ cơ sở dữ liệu
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Tìm người dùng theo username
     *
     * @param username Tên đăng nhập của người d��ng
     * @return Người dùng tương ứng (nếu có)
     */
    Optional<User> findByUsername(String username);

    /**
     * Kiểm tra xem username đã tồn tại chưa
     *
     * @param username Tên đăng nhập cần kiểm tra
     * @return true nếu username đã tồn tại, false nếu chưa
     */
    boolean existsByUsername(String username);

    /**
     * Kiểm tra xem email đã tồn tại chưa
     *
     * @param email Email cần kiểm tra
     * @return true nếu email đã tồn tại, false nếu chưa
     */
    boolean existsByEmail(String email);
}
