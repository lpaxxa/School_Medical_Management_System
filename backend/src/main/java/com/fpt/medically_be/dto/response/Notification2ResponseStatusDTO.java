package com.fpt.medically_be.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification2ResponseStatusDTO {

    private List<ParentDTO2> accepted;
    private List<ParentDTO2> pending;
    private List<ParentDTO2> declined;
}
