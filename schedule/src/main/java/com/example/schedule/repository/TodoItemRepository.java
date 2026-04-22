package com.example.schedule.repository;

import com.example.schedule.domain.TodoItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TodoItemRepository extends JpaRepository<TodoItem, Long> {
    // 특정 유저의 특정 날짜 할 일만 가져옵니다.
    List<TodoItem> findByUserIdAndDate(Long userId, String date);

    // 달력 완료 표시를 위해 유저의 모든 데이터를 가져옵니다.
    List<TodoItem> findByUserId(Long userId);
}