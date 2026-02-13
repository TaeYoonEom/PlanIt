package com.example.schedule.repository;

import com.example.schedule.domain.Habit;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HabitRepository extends JpaRepository<Habit, Long> {
    // 특정 유저의 특정 날짜 습관 목록만 가져오기
    List<Habit> findByUserIdAndDate(Long userId, String date);
    List<Habit> findByUserId(Long userId); // 전체 조회를 위해 추가
}