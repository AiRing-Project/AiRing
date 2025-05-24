package com.airing.backend.user.repository;

import com.airing.backend.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
public interface UserRepository extends JpaRepository<User, Integer> {
    public User findByUsername(String username);
}
