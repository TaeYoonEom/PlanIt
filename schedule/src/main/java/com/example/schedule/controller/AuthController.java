package com.example.schedule.controller;

import com.example.schedule.domain.User;
import com.example.schedule.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserRepository userRepository;

    // 회원가입
    @PostMapping("/signup")
    public String signup(@RequestBody User user) {
        // 실제로는 비밀번호 암호화(BCrypt) 과정이 꼭 필요합니다!
        userRepository.save(user);
        return "회원가입 성공!";
    }

    // 로그인
    @PostMapping("/login")
    public User login(@RequestBody Map<String, String> loginData) {
        User user = userRepository.findByEmail(loginData.get("email"))
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        if(!user.getPassword().equals(loginData.get("password"))) {
            throw new RuntimeException("비밀번호가 틀렸습니다.");
        }
        return user; // 성공 시 사용자 정보 반환
    }
}