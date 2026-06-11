package com.lastrep.backend.service;

import com.lastrep.backend.dto.*;
import com.lastrep.backend.model.*;
import com.lastrep.backend.repository.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RoutineService {

    private final RoutineRepository routineRepository;
    private final RoutineExerciseRepository routineExerciseRepository;
    private final ExerciseRepository exerciseRepository;
    private final UserService userService;

    public RoutineService(RoutineRepository routineRepository,
                          RoutineExerciseRepository routineExerciseRepository,
                          ExerciseRepository exerciseRepository,
                          UserService userService) {
        this.routineRepository = routineRepository;
        this.routineExerciseRepository = routineExerciseRepository;
        this.exerciseRepository = exerciseRepository;
        this.userService = userService;
    }

    public List<RoutineResponse> getAllRoutines() {
        User user = userService.getCurrentUser();
        return routineRepository.findByUserIdOrderByRoutineOrderAsc(user.getId())
                .stream()
                .map(RoutineResponse::new)
                .collect(Collectors.toList());
    }

    public RoutineResponse getRoutine(Long id) {
        User user = userService.getCurrentUser();
        Routine routine = routineRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Routine not found"));
        return new RoutineResponse(routine);
    }

    public RoutineResponse createRoutine(RoutineRequest request) {
        User user = userService.getCurrentUser();

        // Set routine order to end of list
        List<Routine> existing = routineRepository.findByUserIdOrderByRoutineOrderAsc(user.getId());
        int nextOrder = existing.size();

        Routine routine = new Routine();
        routine.setUser(user);
        routine.setName(request.getName());
        routine.setDescription(request.getDescription());
        routine.setRoutineOrder(nextOrder);

        return new RoutineResponse(routineRepository.save(routine));
    }

    public RoutineResponse updateRoutine(Long id, RoutineRequest request) {
        User user = userService.getCurrentUser();
        Routine routine = routineRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Routine not found"));

        routine.setName(request.getName());
        routine.setDescription(request.getDescription());

        return new RoutineResponse(routineRepository.save(routine));
    }

    public void deleteRoutine(Long id) {
        User user = userService.getCurrentUser();
        Routine routine = routineRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Routine not found"));
        routineRepository.delete(routine);
    }

    public RoutineResponse addExercise(Long routineId, RoutineExerciseRequest request) {
        User user = userService.getCurrentUser();
        Routine routine = routineRepository.findByIdAndUserId(routineId, user.getId())
                .orElseThrow(() -> new RuntimeException("Routine not found"));

        Exercise exercise = exerciseRepository.findByIdAndUserId(request.getExerciseId(), user.getId())
                .orElseThrow(() -> new RuntimeException("Exercise not found"));

        int nextIndex = routine.getRoutineExercises().size();

        RoutineExercise re = new RoutineExercise();
        re.setRoutine(routine);
        re.setExercise(exercise);
        re.setOrderIndex(nextIndex);
        re.setTargetSets(request.getTargetSets());
        re.setTargetMinReps(request.getTargetMinReps());
        re.setTargetMaxReps(request.getTargetMaxReps());

        routine.getRoutineExercises().add(re);
        return new RoutineResponse(routineRepository.save(routine));
    }

    public void removeExercise(Long routineId, Long routineExerciseId) {
        User user = userService.getCurrentUser();
        Routine routine = routineRepository.findByIdAndUserId(routineId, user.getId())
                .orElseThrow(() -> new RuntimeException("Routine not found"));

        RoutineExercise re = routineExerciseRepository
                .findByIdAndRoutineId(routineExerciseId, routineId)
                .orElseThrow(() -> new RuntimeException("Exercise not found in routine"));

        routine.getRoutineExercises().remove(re);
        routineRepository.save(routine);
    }
}