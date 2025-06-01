package com.airing.backend.auth.refreshToken;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, String> {
    boolean existsByToken(String token);
    Optional<RefreshToken> findByToken(String token);
}
