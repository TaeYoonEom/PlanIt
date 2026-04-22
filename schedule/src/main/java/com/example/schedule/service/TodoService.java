package com.example.schedule.service;

import com.example.schedule.domain.TodoCategory;
import com.example.schedule.domain.TodoItem;
import com.example.schedule.repository.TodoCategoryRepository;
import com.example.schedule.repository.TodoItemRepository;
import com.example.schedule.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TodoService {
    private final TodoCategoryRepository categoryRepository;
    private final TodoItemRepository itemRepository;
    private final UserRepository userRepository;

    // TodoService.java 내 수정
    public List<TodoCategory> getCategoriesWithItems(Long userId, String date) {
        // 유저의 카테고리 로드
        List<TodoCategory> categories = categoryRepository.findByUserId(userId);

        // 각 카테고리를 순회하며 아이템 필터링
        for (TodoCategory category : categories) {
            // stream() 결과를 새로운 ArrayList로 감싸서 전달 (영속성 전이 방지)
            List<TodoItem> filteredItems = new ArrayList<>(
                    category.getItems().stream()
                            .filter(item -> item.getDate() != null && item.getDate().equals(date))
                            .toList()
            );
            category.setItems(filteredItems);
        }
        return categories;
    }

    // 💡 2. 큰 제목(주제) 추가
    @Transactional
    public TodoCategory addCategory(Long userId, TodoCategory category) {
        category.setUser(userRepository.findById(userId).orElseThrow());
        return categoryRepository.save(category);
    }

    // 💡 3. 특정 카테고리에 세부 할 일 추가 (이게 태윤님이 원하시던 기능!)
    @Transactional
    public TodoItem addTodoItem(Long categoryId, TodoItem item) {
        TodoCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("카테고리 없음"));

        item.setCategory(category); // 💡 여기서 카테고리와 할 일을 연결해줍니다!
        return itemRepository.save(item);
    }

    // 💡 4. 할 일 체크 토글
    @Transactional
    public void toggleTodo(Long itemId) {
        TodoItem item = itemRepository.findById(itemId).orElseThrow();
        item.setDone(!item.isDone());
    }

    @Transactional
    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }

    @Transactional
    public void deleteTodoItem(Long itemId) {
        itemRepository.deleteById(itemId);
    }
}