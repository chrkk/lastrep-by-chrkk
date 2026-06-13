package com.lastrep.backend.repository;

import com.lastrep.backend.model.SessionStatus;
import com.lastrep.backend.model.WorkoutSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface WorkoutSessionRepository extends JpaRepository<WorkoutSession, Long> {
    List<WorkoutSession> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, SessionStatus status);
    List<WorkoutSession> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<WorkoutSession> findByIdAndUserId(Long id, Long userId);
    Optional<WorkoutSession> findFirstByUserIdAndStatusOrderByCreatedAtDesc(Long userId, SessionStatus status);
}