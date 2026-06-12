package com.lastrep.backend.service;

import com.lastrep.backend.dto.*;
import com.lastrep.backend.model.*;
import com.lastrep.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.lastrep.backend.model.WeightUnit;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WorkoutSessionService {

    private final WorkoutSessionRepository sessionRepository;
    private final WorkoutSessionExerciseRepository sessionExerciseRepository;
    private final WorkoutSetGroupRepository setGroupRepository;
    private final RoutineRepository routineRepository;
    private final ExerciseRepository exerciseRepository;
    private final UserService userService;

    public WorkoutSessionService(WorkoutSessionRepository sessionRepository,
                                 WorkoutSessionExerciseRepository sessionExerciseRepository,
                                 WorkoutSetGroupRepository setGroupRepository,
                                 RoutineRepository routineRepository,
                                 ExerciseRepository exerciseRepository,
                                 UserService userService) {
        this.sessionRepository = sessionRepository;
        this.sessionExerciseRepository = sessionExerciseRepository;
        this.setGroupRepository = setGroupRepository;
        this.routineRepository = routineRepository;
        this.exerciseRepository = exerciseRepository;
        this.userService = userService;
    }

    @Transactional
    public WorkoutSessionResponse startSession(StartSessionRequest request) {
        User user = userService.getCurrentUser();

        Routine routine = routineRepository.findByIdAndUserId(request.getRoutineId(), user.getId())
                .orElseThrow(() -> new RuntimeException("Routine not found"));

        WorkoutSession session = new WorkoutSession();
        session.setUser(user);
        session.setRoutine(routine);
        session.setStatus(SessionStatus.IN_PROGRESS);

        session = sessionRepository.save(session);

        int index = 0;
        for (RoutineExercise re : routine.getRoutineExercises()) {
            WorkoutSessionExercise se = new WorkoutSessionExercise();
            se.setWorkoutSession(session);
            se.setExercise(re.getExercise());
            se.setOrderIndex(index++);
            session.getSessionExercises().add(se);
        }

        return new WorkoutSessionResponse(sessionRepository.save(session));
    }

    public WorkoutSessionResponse getSession(Long sessionId) {
        User user = userService.getCurrentUser();
        WorkoutSession session = sessionRepository.findByIdAndUserId(sessionId, user.getId())
                .orElseThrow(() -> new RuntimeException("Session not found"));
        return new WorkoutSessionResponse(session);
    }

    public List<WorkoutSessionResponse> getAllSessions() {
        User user = userService.getCurrentUser();
        return sessionRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(WorkoutSessionResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public WorkoutSessionResponse logSet(Long sessionId, Long sessionExerciseId,
                                         LogSetRequest request) {
        User user = userService.getCurrentUser();
        WorkoutSession session = sessionRepository.findByIdAndUserId(sessionId, user.getId())
                .orElseThrow(() -> new RuntimeException("Session not found"));

        WorkoutSessionExercise se = sessionExerciseRepository
                .findByIdAndWorkoutSessionId(sessionExerciseId, sessionId)
                .orElseThrow(() -> new RuntimeException("Session exercise not found"));

        int nextSetNumber = se.getSetGroups().size() + 1;

        WorkoutSetGroup group = new WorkoutSetGroup();
        group.setSessionExercise(se);
        group.setSetNumber(nextSetNumber);
        group.setSetType(request.getSetType() != null ? request.getSetType() : SetType.NORMAL);

        int entryNum = 1;
        for (SetEntryRequest entryReq : request.getEntries()) {
            WorkoutSetEntry entry = new WorkoutSetEntry();
            entry.setSetGroup(group);
            entry.setEntryNumber(entryNum++);
            entry.setWeight(entryReq.getWeight());
            entry.setWeightUnit(entryReq.getWeightUnit() != null
                    ? entryReq.getWeightUnit() : WeightUnit.KG);
            entry.setReps(entryReq.getReps());
            entry.setReachedFailure(entryReq.getReachedFailure() != null
                    ? entryReq.getReachedFailure() : false);
            entry.setRestSeconds(entryReq.getRestSeconds());
            group.getEntries().add(entry);
        }

        se.getSetGroups().add(group);
        sessionRepository.save(session);

        return new WorkoutSessionResponse(
                sessionRepository.findByIdAndUserId(sessionId, user.getId()).get());
    }

    @Transactional
    public WorkoutSessionResponse deleteSet(Long sessionId, Long sessionExerciseId,
                                            Long setGroupId) {
        User user = userService.getCurrentUser();
        WorkoutSession session = sessionRepository.findByIdAndUserId(sessionId, user.getId())
                .orElseThrow(() -> new RuntimeException("Session not found"));

        WorkoutSessionExercise se = sessionExerciseRepository
                .findByIdAndWorkoutSessionId(sessionExerciseId, sessionId)
                .orElseThrow(() -> new RuntimeException("Session exercise not found"));

        WorkoutSetGroup group = se.getSetGroups().stream()
                .filter(g -> g.getId().equals(setGroupId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Set group not found"));

        se.getSetGroups().remove(group);
        setGroupRepository.delete(group);

        return new WorkoutSessionResponse(
                sessionRepository.findByIdAndUserId(sessionId, user.getId()).get());
    }

    @Transactional
    public WorkoutSessionResponse addExerciseToSession(Long sessionId, Long exerciseId) {
        User user = userService.getCurrentUser();
        WorkoutSession session = sessionRepository.findByIdAndUserId(sessionId, user.getId())
                .orElseThrow(() -> new RuntimeException("Session not found"));

        Exercise exercise = exerciseRepository.findByIdAndUserId(exerciseId, user.getId())
                .orElseThrow(() -> new RuntimeException("Exercise not found"));

        int nextIndex = session.getSessionExercises().size();

        WorkoutSessionExercise se = new WorkoutSessionExercise();
        se.setWorkoutSession(session);
        se.setExercise(exercise);
        se.setOrderIndex(nextIndex);
        session.getSessionExercises().add(se);

        return new WorkoutSessionResponse(sessionRepository.save(session));
    }

    @Transactional
    public WorkoutSessionResponse finishSession(Long sessionId) {
        User user = userService.getCurrentUser();
        WorkoutSession session = sessionRepository.findByIdAndUserId(sessionId, user.getId())
                .orElseThrow(() -> new RuntimeException("Session not found"));

        session.setStatus(SessionStatus.COMPLETED);
        session.setFinishedAt(LocalDateTime.now());

        return new WorkoutSessionResponse(sessionRepository.save(session));
    }

    @Transactional
    public void cancelSession(Long sessionId) {
        User user = userService.getCurrentUser();
        WorkoutSession session = sessionRepository.findByIdAndUserId(sessionId, user.getId())
                .orElseThrow(() -> new RuntimeException("Session not found"));

        session.setStatus(SessionStatus.CANCELLED);
        sessionRepository.save(session);
    }

    public LastPerformanceResponse getLastPerformance(Long exerciseId) {
        User user = userService.getCurrentUser();

        List<WorkoutSession> completedSessions = sessionRepository
                .findByUserIdAndStatusOrderByCreatedAtDesc(user.getId(), SessionStatus.COMPLETED);

        for (WorkoutSession session : completedSessions) {
            for (WorkoutSessionExercise se : session.getSessionExercises()) {
                if (se.getExercise().getId().equals(exerciseId)
                        && !se.getSetGroups().isEmpty()) {
                    List<SetGroupResponse> groups = se.getSetGroups()
                            .stream()
                            .map(SetGroupResponse::new)
                            .collect(Collectors.toList());
                    return new LastPerformanceResponse(
                            exerciseId,
                            se.getExercise().getName(),
                            session.getCreatedAt(),
                            groups);
                }
            }
        }
        return null;
    }
}