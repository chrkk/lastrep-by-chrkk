package com.lastrep.backend.service;

import com.lastrep.backend.dto.ExerciseRequest;
import com.lastrep.backend.dto.ExerciseResponse;
import com.lastrep.backend.model.Exercise;
import com.lastrep.backend.model.User;
import com.lastrep.backend.repository.ExerciseRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExerciseService {

    private final ExerciseRepository exerciseRepository;
    private final UserService userService;

    public ExerciseService(ExerciseRepository exerciseRepository,
                           UserService userService) {
        this.exerciseRepository = exerciseRepository;
        this.userService = userService;
    }

    public List<ExerciseResponse> getAllExercises() {
        User user = userService.getCurrentUser();
        return exerciseRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(ExerciseResponse::new)
                .collect(Collectors.toList());
    }

    public ExerciseResponse getExercise(Long id) {
        User user = userService.getCurrentUser();
        Exercise exercise = exerciseRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Exercise not found"));
        return new ExerciseResponse(exercise);
    }

    public ExerciseResponse createExercise(ExerciseRequest request) {
        User user = userService.getCurrentUser();

        Exercise exercise = new Exercise();
        exercise.setUser(user);
        exercise.setName(request.getName());
        exercise.setMuscleGroup(request.getMuscleGroup());
        exercise.setEquipment(request.getEquipment());

        return new ExerciseResponse(exerciseRepository.save(exercise));
    }

    public ExerciseResponse updateExercise(Long id, ExerciseRequest request) {
        User user = userService.getCurrentUser();
        Exercise exercise = exerciseRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Exercise not found"));

        exercise.setName(request.getName());
        exercise.setMuscleGroup(request.getMuscleGroup());
        exercise.setEquipment(request.getEquipment());

        return new ExerciseResponse(exerciseRepository.save(exercise));
    }

    public void deleteExercise(Long id) {
        User user = userService.getCurrentUser();
        Exercise exercise = exerciseRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Exercise not found"));
        exerciseRepository.delete(exercise);
    }
}