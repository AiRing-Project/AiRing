package com.airing.backend.auth.Service;

import com.airing.backend.auth.dto.ResetPasswordRequest;
import com.airing.backend.auth.dto.TokenReissueRequest;
import com.airing.backend.auth.jwt.JwtProvider;
import com.airing.backend.auth.refreshToken.RefreshToken;
import com.airing.backend.auth.refreshToken.RefreshTokenRepository;
import com.airing.backend.user.dto.UserLoginRequest;
import com.airing.backend.user.dto.UserLoginResponse;
import com.airing.backend.user.dto.UserSignupRequest;
import com.airing.backend.user.entity.User;
import com.airing.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final RefreshTokenRepository refreshTokenRepository;

    public UserLoginResponse login(UserLoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "존재하지 않는 사용자입니다."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "비밀번호가 올바르지 않습니다.");
        }

        String accessToken = jwtProvider.createToken(user.getEmail(), user.getRoles());
        String refreshToken = generateSecureRefreshToken();

        refreshTokenRepository.save(new RefreshToken(user.getEmail(), refreshToken));

        return new UserLoginResponse(accessToken, refreshToken, user.getUsername(), user.getEmail());
    }

    public void signup(UserSignupRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 가입된 이메일입니다.");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRoles("ROLE_USER");

        userRepository.save(user);
    }

    public UserLoginResponse reissue(TokenReissueRequest request) {
        Optional<RefreshToken> optionalToken = refreshTokenRepository.findByToken(request.getRefreshToken());
        if (optionalToken.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh Token이 유효하지 않습니다.");
        }

        RefreshToken stored = optionalToken.get();

        User user = userRepository.findByEmail(stored.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "사용자를 찾을 수 없습니다."));

        refreshTokenRepository.deleteById(user.getEmail());

        String newAccessToken = jwtProvider.createToken(user.getEmail(), user.getRoles());
        String newRefreshToken = generateSecureRefreshToken();

        refreshTokenRepository.save(new RefreshToken(user.getEmail(), newRefreshToken));

        return new UserLoginResponse(newAccessToken, newRefreshToken, user.getUsername(), user.getEmail());
    }

    public void logout(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Refresh Token이 필요합니다.");
        }

        String refreshToken = authorizationHeader.substring(7);

        refreshTokenRepository.findByToken(refreshToken)
                .ifPresent(refreshTokenRepository::delete);
    }

    public void resetPassword(String authorizationHeader, ResetPasswordRequest request) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Access Token이 필요합니다.");
        }

        String accessToken = authorizationHeader.substring(7);
        String email = jwtProvider.getEmailFromToken(accessToken);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "현재 비밀번호가 일치하지 않습니다.");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "기존 비밀번호와 새 비밀번호가 같습니다.");
        }

        String encodedNewPassword = passwordEncoder.encode(request.getNewPassword());
        user.setPassword(encodedNewPassword);
        userRepository.save(user);
    }

    private String generateSecureRefreshToken() {
        byte[] randomBytes = new byte[64];
        new SecureRandom().nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }
}
