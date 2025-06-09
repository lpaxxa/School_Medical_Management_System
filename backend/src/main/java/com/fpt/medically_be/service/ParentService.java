package com.fpt.medically_be.service;

import com.fpt.medically_be.dto.ParentDTO;
import java.util.List;

public interface ParentService {
    List<ParentDTO> getAllParents();
    ParentDTO getParentById(Long id);
    ParentDTO getParentByEmail(String email);
    ParentDTO getParentByPhoneNumber(String phoneNumber);
    ParentDTO getParentByAccountId(String accountId);
    ParentDTO createParent(ParentDTO parentDTO);
    ParentDTO updateParent(Long id, ParentDTO parentDTO);
    void deleteParent(Long id);

}
