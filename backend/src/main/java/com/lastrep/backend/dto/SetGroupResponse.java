package com.lastrep.backend.dto;

import com.lastrep.backend.model.SetType;
import com.lastrep.backend.model.WorkoutSetGroup;
import java.util.List;
import java.util.stream.Collectors;

public class SetGroupResponse {
    private Long id;
    private Integer setNumber;
    private SetType setType;
    private List<SetEntryResponse> entries;

    public SetGroupResponse(WorkoutSetGroup group) {
        this.id = group.getId();
        this.setNumber = group.getSetNumber();
        this.setType = group.getSetType();
        this.entries = group.getEntries()
                .stream()
                .map(SetEntryResponse::new)
                .collect(Collectors.toList());
    }

    public Long getId() { return id; }
    public Integer getSetNumber() { return setNumber; }
    public SetType getSetType() { return setType; }
    public List<SetEntryResponse> getEntries() { return entries; }
}