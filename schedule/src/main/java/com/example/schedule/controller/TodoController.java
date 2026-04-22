package com.example.schedule.controller;

import com.example.schedule.domain.TodoCategory;
import com.example.schedule.domain.TodoItem;
import com.example.schedule.service.TodoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/todo")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class TodoController {
    private final TodoService todoService;

    @GetMapping("/categories/user/{userId}")
    public List<TodoCategory> getCategories(@PathVariable Long userId, @RequestParam String date) {
        return todoService.getCategoriesWithItems(userId, date);
    }

    @PostMapping("/categories/{userId}")
    public TodoCategory addCategory(@PathVariable Long userId, @RequestBody TodoCategory category) {
        return todoService.addCategory(userId, category);
    }

    @PostMapping("/categories/{categoryId}/items")
    public TodoItem addItem(@PathVariable Long categoryId, @RequestBody TodoItem item) {
        return todoService.addTodoItem(categoryId, item);
    }

    @PutMapping("/items/{itemId}/toggle")
    public void toggleTodo(@PathVariable Long itemId) {
        todoService.toggleTodo(itemId);
    }

    // TodoController.java

    // 1. 상세 할 일 삭제
    @DeleteMapping("/items/{itemId}")
    public void deleteTodoItem(@PathVariable Long itemId) {
        todoService.deleteTodoItem(itemId);
    }

    // 2. 카테고리 전체 삭제
    @DeleteMapping("/categories/{categoryId}")
    public void deleteCategory(@PathVariable Long categoryId) {
        todoService.deleteCategory(categoryId);
    }
}