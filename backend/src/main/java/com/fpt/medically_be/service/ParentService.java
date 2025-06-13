package com.fpt.medically_be.service;

import com.fpt.medically_be.dto.response.ParentDTO;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface ParentService {
    ParentDTO getCurretParent(Authentication authentication);
    void validateParentOwnsStudent(Long studentId, Authentication authentication);

    List<ParentDTO> getAllParents();
    ParentDTO getParentById(Long id);
    ParentDTO getParentByEmail(String email);
    ParentDTO getParentByPhoneNumber(String phoneNumber);
    ParentDTO getParentByAccountId(String accountId);
    ParentDTO createParent(ParentDTO parentDTO);
    ParentDTO updateParent(Long id, ParentDTO parentDTO);
    void deleteParent(Long id);

    void linkStudentsToParent(Long id, List<Long> studentIds);

}
