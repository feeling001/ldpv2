package com.ldpv2.domain.enums;

public enum ApplicationStatus {
    IDEA("Idea"),
    IN_DEVELOPMENT("In Development"),
    IN_SERVICE("In Service"),
    MAINTENANCE("Maintenance"),
    DECOMMISSIONED("Decommissioned");
    
    private final String displayName;
    
    ApplicationStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
