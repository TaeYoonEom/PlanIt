package com.example.schedule.service;

import com.example.schedule.domain.Habit;
import com.example.schedule.repository.HabitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HabitService {
    private final HabitRepository habitRepository;

    // 특정 유저의 모든 습관 가져오기 (달력 표시용)
    public List<Habit> getAllHabits(Long userId) {
        return habitRepository.findByUserId(userId);
    }

    // 특정 유저의 특정 날짜 습관 가져오기
    public List<Habit> getHabits(Long userId, String date) {
        return habitRepository.findByUserIdAndDate(userId, date);
    }

    // 습관 저장
    public Habit addHabit(Habit habit) {
        return habitRepository.save(habit);
    }

    @Transactional //
    public void toggleHabit(Long id) {
        Habit habit = habitRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 습관이 없습니다.")); //

        // 명확하게 반전시켜서 저장
        habit.setDone(!habit.isDone()); //
        habitRepository.saveAndFlush(habit); // DB에 즉시 반영 강제
    }

    @Transactional
    public void updateHabitDate(Long id, String newDate) {
        Habit habit = habitRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 습관이 없습니다."));
        habit.setDate(newDate); // 새로운 날짜로 업데이트
    }

    public void deleteHabit(Long id) {
        habitRepository.deleteById(id);
    }
}