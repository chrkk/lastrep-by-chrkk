package com.lastrep.backend.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "workout_set_groups")
public class WorkoutSetGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_exercise_id", nullable = false)
    private WorkoutSessionExercise sessionExercise;

    @Column(nullable = false)
    private Integer setNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SetType setType = SetType.NORMAL;

    private String notes;

    @OneToMany(mappedBy = "setGroup", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("entryNumber ASC")
    private List<WorkoutSetEntry> entries = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public WorkoutSessionExercise getSessionExercise() { return sessionExercise; }
    public void setSessionExercise(WorkoutSessionExercise sessionExercise) { this.sessionExercise = sessionExercise; }

    public Integer getSetNumber() { return setNumber; }
    public void setSetNumber(Integer setNumber) { this.setNumber = setNumber; }

    public SetType getSetType() { return setType; }
    public void setSetType(SetType setType) { this.setType = setType; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public List<WorkoutSetEntry> getEntries() { return entries; }
    public void setEntries(List<WorkoutSetEntry> entries) { this.entries = entries; }
}