package com.example.schedule.controller;

import com.example.schedule.domain.Schedule;
import com.example.schedule.dto.ScheduleResponse;
import com.example.schedule.service.ScheduleService; // 서비스 임포트
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/schedules")
@RequiredArgsConstructor
public class ScheduleController {

    // 정석: 이제 Repository 대신 Service를 주입받아 사용합니다.
    private final ScheduleService scheduleService;

    // 저장: 서비스의 saveSchedule 로직을 사용하도록 수정
    @PostMapping("/{userId}")
    public void create(
            @PathVariable Long userId,
            @RequestBody Schedule schedule
    ) {
        scheduleService.saveSchedule(userId, schedule);
    }

    // 조회: 중복을 제거하고 DTO(ScheduleResponse) 리스트를 반환합니다.
    @GetMapping("/user/{userId}")
    public List<ScheduleResponse> findByUser(@PathVariable Long userId) {
        return scheduleService.getSchedules(userId);
    }

    // 삭제
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        scheduleService.deleteSchedule(id);
    }
}