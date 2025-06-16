package com.fpt.medically_be.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentDTO {
    private Long id;
    private String fullName;
    private LocalDate dateOfBirth;
    private String gender;
    private String studentId;
    private String className;
    private String gradeLevel;
    private String schoolYear;
    private String imageUrl;
    private Long healthProfileId;
    private Long parentId;
    
    // Frontend compatibility fields
    @JsonProperty("name")
    public String getName() {
        return this.fullName;
    }
    
    @JsonProperty("class")
    public String getClass_() {
        return this.className;
    }

}
