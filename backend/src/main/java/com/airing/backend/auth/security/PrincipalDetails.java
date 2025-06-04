package com.airing.backend.auth.security;


import java.util.ArrayList;
import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.airing.backend.user.entity.User;

/**
 * Spring Security는 /login 으로 오는 POST 요청을 낚아채서 로그인 처리함.
 * 로그인에 성공하면 Security Session을 생성하고, 그 안에 Authentication 객체를 저장함.
 * 이 Authentication 객체는 SecurityContextHolder를 통해 전역에서 접근 가능함.
 * Authentication 객체 내부에는 User 정보가 들어있어야 하고,
 * 이 User 정보는 반드시 UserDetails 타입으로 구현되어 있어야 함.
 *
 * 즉, Security Session => Authentication => UserDetails(PrincipalDetails)
 */
public class PrincipalDetails implements UserDetails {

    private User user;

    public PrincipalDetails(User user) {
        this.user = user;
    }

    public Long getId() {
        return user.getId();
    }
    
    public String getNickname() {
        return user.getUsername();
    }

    // 해당 User의 권한을 리턴함
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {

        Collection<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority(user.getRoles()));

        return authorities;
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // 일단 시간제한 x
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // 계정 잠구지 않음
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // 기한 만료 x
    }

    @Override
    public boolean isEnabled() {
        return true; // 계정 활성화
    }
}
