package com.lastrep.backend.service;

import com.lastrep.backend.dto.DashboardResponse;
import com.lastrep.backend.dto.RecentSessionResponse;
import com.lastrep.backend.model.*;
import com.lastrep.backend.repository.*;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final WorkoutSessionRepository sessionRepository;
    private final RoutineRepository routineRepository;
    private final UserService userService;

    public DashboardService(WorkoutSessionRepository sessionRepository,
                            RoutineRepository routineRepository,
                            UserService userService) {
        this.sessionRepository = sessionRepository;
        this.routineRepository = routineRepository;
        this.userService = userService;
    }

    public DashboardResponse getDashboard() {
        User user = userService.getCurrentUser();
        DashboardResponse response = new DashboardResponse();

        List<WorkoutSession> completed = sessionRepository
                .findByUserIdAndStatusOrderByCreatedAtDesc(
                        user.getId(), SessionStatus.COMPLETED);

        if (!completed.isEmpty()) {
            WorkoutSession last = completed.get(0);
            response.setLastWorkoutRoutineName(
                    last.getRoutine() != null ? last.getRoutine().getName() : "Custom");
            response.setLastWorkoutDate(last.getCreatedAt());
            if (last.getFinishedAt() != null) {
                response.setLastWorkoutDuration(
                        Duration.between(last.getCreatedAt(), last.getFinishedAt()).getSeconds());
            }
            setSuggestedRoutine(user.getId(), last, response);
        } else {
            setFirstRoutineAsSuggested(user.getId(), response);
        }

        LocalDateTime weekStart = LocalDateTime.now().minusDays(7);
        long weeklyCount = completed.stream()
                .filter(s -> s.getCreatedAt().isAfter(weekStart))
                .count();
        response.setWeeklySessionCount((int) weeklyCount);

        List<RecentSessionResponse> recent = completed.stream()
                .limit(5)
                .map(RecentSessionResponse::new)
                .collect(Collectors.toList());
        response.setRecentSessions(recent);

        return response;
    }

    private void setSuggestedRoutine(Long userId, WorkoutSession lastSession,
                                     DashboardResponse response) {
        List<Routine> routines = routineRepository
                .findByUserIdOrderByRoutineOrderAsc(userId);
        if (routines.isEmpty()) return;

        if (lastSession.getRoutine() == null) {
            response.setSuggestedRoutineId(routines.get(0).getId());
            response.setSuggestedRoutineName(routines.get(0).getName());
            return;
        }

        Long lastRoutineId = lastSession.getRoutine().getId();
        for (int i = 0; i < routines.size(); i++) {
            if (routines.get(i).getId().equals(lastRoutineId)) {
                int nextIndex = (i + 1) % routines.size();
                response.setSuggestedRoutineId(routines.get(nextIndex).getId());
                response.setSuggestedRoutineName(routines.get(nextIndex).getName());
                return;
            }
        }

        response.setSuggestedRoutineId(routines.get(0).getId());
        response.setSuggestedRoutineName(routines.get(0).getName());
    }

    private void setFirstRoutineAsSuggested(Long userId, DashboardResponse response) {
        List<Routine> routines = routineRepository
                .findByUserIdOrderByRoutineOrderAsc(userId);
        if (routines.isEmpty()) return;
        response.setSuggestedRoutineId(routines.get(0).getId());
        response.setSuggestedRoutineName(routines.get(0).getName());
    }
}