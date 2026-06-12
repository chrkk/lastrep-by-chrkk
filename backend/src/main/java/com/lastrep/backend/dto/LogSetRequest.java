package com.lastrep.backend.dto;

import com.lastrep.backend.model.SetType;
import java.util.List;

public class LogSetRequest {
    private SetType setType;
    private List<SetEntryRequest> entries;

    public SetType getSetType() { return setType; }
    public void setSetType(SetType setType) { this.setType = setType; }

    public List<SetEntryRequest> getEntries() { return entries; }
    public void setEntries(List<SetEntryRequest> entries) { this.entries = entries; }
}