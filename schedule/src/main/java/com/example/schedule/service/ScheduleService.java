// src/main/java/com/example/schedule/service/ScheduleService.java
package com.example.schedule.service;

import com.example.schedule.domain.Schedule;
import com.example.schedule.domain.User;
import com.example.schedule.dto.ScheduleResponse;
import com.example.schedule.repository.ScheduleRepository;
import com.example.schedule.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ScheduleService {
    private final ScheduleRepository scheduleRepository;
    private final UserRepository userRepository;

    // 조회 (DTO로 변환해서 반환)
    public List<ScheduleResponse> getSchedules(Long userId) {
        return scheduleRepository.findByUserId(userId).stream()
                .map(s -> new ScheduleResponse(s.getId(), s.getTitle(), s.getDescription(),
                        s.getStartTime(), s.getEndTime(), s.getColor(), s.isCompleted()))
                .collect(Collectors.toList());
    }

    // 저장
    @Transactional
    public void saveSchedule(Long userId, Schedule schedule) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("유저 없음"));
        schedule.setUser(user);
        scheduleRepository.save(schedule);
    }

    // 삭제
    @Transactional
    public void deleteSchedule(Long id) {
        scheduleRepository.deleteById(id);
    }

    @Transactional
    public void updateScheduleTime(Long id, String newStartTime) {
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 일정이 없습니다."));

        // 💡 String으로 들어온 날짜를 LocalDateTime으로 변환
        LocalDateTime parsedTime = LocalDateTime.parse(newStartTime);

        schedule.setStartTime(parsedTime);
        schedule.setEndTime(parsedTime); // 필요하다면 함께 수정
    }
}