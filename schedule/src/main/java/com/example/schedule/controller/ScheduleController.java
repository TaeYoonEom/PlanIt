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
        return scheduleRepository.findByUserId(userId);
    }
}
