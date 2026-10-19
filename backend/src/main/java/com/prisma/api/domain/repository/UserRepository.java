package com.prisma.api.domain.repository;

import com.prisma.api.domain.entities.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    Optional<User> findByUsernameIgnoreCase(String username);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select u from User u where lower(u.username) = lower(:username)")
    Optional<User> findByUsernameIgnoreCaseForUpdate(@Param("username") String username);
}
