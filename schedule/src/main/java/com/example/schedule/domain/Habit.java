package com.example.schedule.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id; // 반드시 이 패키지여야 합니다!
import jakarta.persistence.Column;
import lombok.*;

@Entity
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Habit {

    @Id // 반드시 jakarta.persistence.Id 여야 합니다.
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(name = "is_done", nullable = false)
    private boolean done; // 필드명을 isDone에서 done으로 변경

    private String date;

    private Long userId;
}