package com.example.schedule.repository;

import com.example.schedule.domain.TodoCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TodoCategoryRepository extends JpaRepository<TodoCategory, Long> {
    // 특정 유저의 모든 카테고리를 가져옵니다.
    List<TodoCategory> findByUserId(Long userId);
}