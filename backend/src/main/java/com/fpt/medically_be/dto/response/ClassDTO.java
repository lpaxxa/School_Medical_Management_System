package com.fpt.medically_be.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassDTO {
    
    private String className;
    private String gradeLevel;
    private String schoolYear;
    private Integer studentCount;
    
    // For grouping purposes
    public String getDisplayName() {
        return gradeLevel + " - " + className;
    }
}