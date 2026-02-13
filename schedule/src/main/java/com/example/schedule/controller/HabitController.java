package com.example.schedule.controller;

import com.example.schedule.domain.Habit;
import com.example.schedule.service.HabitService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/habits")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class HabitController {
    private final HabitService habitService;

    @GetMapping("/user/{userId}/{date}")
    public List<Habit> getHabits(@PathVariable Long userId, @PathVariable String date) {
        return habitService.getHabits(userId, date);
    }

    @PostMapping("/{userId}")
    public Habit addHabit(@PathVariable Long userId, @RequestBody Habit habit) {
        habit.setUserId(userId);
        return habitService.addHabit(habit);
    }

    @PutMapping("/{id}/toggle")
    public void toggleHabit(@PathVariable Long id) {
        habitService.toggleHabit(id);
    }

    @DeleteMapping("/{id}")
    public void deleteHabit(@PathVariable Long id) {
        habitService.deleteHabit(id);
    }

    // 전체 습관 조회 (달력 표시용)
    @GetMapping("/user/{userId}/all")
    public List<Habit> getAllHabits(@PathVariable Long userId) {
        return habitService.getAllHabits(userId); // Service에도 메서드 추가 필요
    }

    // 날짜별 완료 상태를 포함한 DTO를 반환하거나, 프론트에서 처리할 수 있게 데이터를 정제합니다.
    @GetMapping("/user/{userId}/calendar")
    public List<Habit> getCalendarHabits(@PathVariable Long userId) {
        return habitService.getAllHabits(userId);
    }

    @PutMapping("/{id}/date")
    public void updateHabitDate(@PathVariable Long id, @RequestParam String date) {
        habitService.updateHabitDate(id, date);
    }
}