package com.example.schedule.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TodoItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title; // 할 일 내용

    @Column(name = "is_done", nullable = false)
    private boolean done; // 완료 여부

    private String date; // YYYY-MM-DD 형식

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    @JsonIgnore
    private TodoCategory category; // 소속된 카테고리

    private Long userId; // 필터링을 위한 유저 ID
}