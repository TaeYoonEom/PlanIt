package com.example.schedule.controller;

import com.example.schedule.domain.Schedule;
import com.example.schedule.domain.User;
import com.example.schedule.repository.ScheduleRepository;
import com.example.schedule.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/schedules")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleRepository scheduleRepository;
    private final UserRepository userRepository;

    @PostMapping("/{userId}")
    public Schedule create(
            @PathVariable Long userId,
            @RequestBody Schedule schedule
    ) {
        User user = userRepository.findById(userId).orElseThrow();
        schedule.setUser(user);
        return scheduleRepository.save(schedule);
    }

    @GetMapping("/user/{userId}")
    public List<Schedule> findByUser(@PathVariable Long userId) {
        List<Schedule> schedules = scheduleRepository.findByUserId(userId);

        // 순환 참조 방지를 위해 응답용 객체에서 user 정보를 비워줍니다.
        schedules.forEach(s -> s.setUser(null));

        return schedules;
    }
}