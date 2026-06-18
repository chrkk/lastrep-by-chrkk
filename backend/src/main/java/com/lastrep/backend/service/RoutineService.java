package com.lastrep.backend.service;
import org.springframework.transaction.annotation.Transactional;
import com.lastrep.backend.dto.*;
import com.lastrep.backend.model.*;
import com.lastrep.backend.repository.*;
import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.stream.Collectors;
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
        re.setRestSeconds(request.getRestSeconds() != null ? request.getRestSeconds() : 90);

        routine.getRoutineExercises().add(re);
        return new RoutineResponse(routineRepository.save(routine));
    }

    @Transactional
    public RoutineResponse reorderExercises(Long routineId, List<Long> routineExerciseIds) {
        User user = userService.getCurrentUser();
        Routine routine = routineRepository.findByIdAndUserId(routineId, user.getId())
                .orElseThrow(() -> new RuntimeException("Routine not found"));

        Map<Long, RoutineExercise> byId = routine.getRoutineExercises().stream()
                .collect(Collectors.toMap(RoutineExercise::getId, re -> re));

        int index = 0;
        for (Long reId : routineExerciseIds) {
            RoutineExercise re = byId.get(reId);
            if (re == null) {
                throw new RuntimeException("Routine exercise not found: " + reId);
            }
            re.setOrderIndex(index++);
        }

        return new RoutineResponse(routineRepository.save(routine));
    }

    @Transactional
    public RoutineResponse duplicateRoutine(Long routineId) {
        User user = userService.getCurrentUser();
        Routine original = routineRepository.findByIdAndUserId(routineId, user.getId())
                .orElseThrow(() -> new RuntimeException("Routine not found"));

        Routine copy = new Routine();
        copy.setUser(user);
        copy.setName(original.getName() + " (Copy)");
        copy.setDescription(original.getDescription());

        int maxOrder = routineRepository.findByUserIdOrderByRoutineOrderAsc(user.getId())
                .stream()
                .map(Routine::getRoutineOrder)
                .filter(o -> o != null)
                .max(Integer::compareTo)
                .orElse(-1);
        copy.setRoutineOrder(maxOrder + 1);

        copy = routineRepository.save(copy);

        int index = 0;
        for (RoutineExercise originalRe : original.getRoutineExercises()) {
            RoutineExercise newRe = new RoutineExercise();
            newRe.setRoutine(copy);
            newRe.setExercise(originalRe.getExercise());
            newRe.setOrderIndex(index++);
            newRe.setTargetSets(originalRe.getTargetSets());
            newRe.setTargetMinReps(originalRe.getTargetMinReps());
            newRe.setTargetMaxReps(originalRe.getTargetMaxReps());
            newRe.setRestSeconds(originalRe.getRestSeconds());
            copy.getRoutineExercises().add(newRe);
        }

        return new RoutineResponse(routineRepository.save(copy));
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