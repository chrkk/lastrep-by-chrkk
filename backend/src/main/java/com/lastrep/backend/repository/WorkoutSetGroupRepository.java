package com.lastrep.backend.repository;

import com.lastrep.backend.model.WorkoutSetGroup;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkoutSetGroupRepository extends JpaRepository<WorkoutSetGroup, Long> {
}