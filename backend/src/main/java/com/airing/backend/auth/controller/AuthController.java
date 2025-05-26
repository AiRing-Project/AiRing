package com.airing.backend.auth.controller;


import com.airing.backend.auth.Service.AuthService;
import com.airing.backend.auth.dto.ResetPasswordRequest;
import com.airing.backend.auth.dto.TokenReissueRequest;
import com.airing.backend.auth.jwt.JwtProvider;
import com.airing.backend.user.dto.UserLoginRequest;
import com.airing.backend.user.dto.UserLoginResponse;
import com.airing.backend.user.dto.UserSignupRequest;
import com.airing.backend.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody UserSignupRequest request) {
        authService.signup(request);
        return ResponseEntity.status(HttpStatus.CREATED).body("회원가입 완료");
    }

    @PostMapping("/login")
    public ResponseEntity<UserLoginResponse> login(@Valid @RequestBody UserLoginRequest request) {
        UserLoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reissue")
    public ResponseEntity<UserLoginResponse> reissue(@RequestBody TokenReissueRequest request) {
        UserLoginResponse response = authService.reissue(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String refreshTokenHeader) {
        authService.logout(refreshTokenHeader);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PutMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
            @RequestHeader("Authorization") String authorizationHeader,
            @Valid @RequestBody ResetPasswordRequest request
    ) {
        authService.resetPassword(authorizationHeader, request);
        return ResponseEntity.ok("비밀번호가 성공적으로 변경되었습니다.");
    }
}
