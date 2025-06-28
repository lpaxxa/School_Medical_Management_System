package com.fpt.medically_be.service;

import com.fpt.medically_be.dto.request.AccountUpdateRequestDTO;
import com.fpt.medically_be.dto.response.AccountAdminResponseDTO;
import com.fpt.medically_be.entity.AccountMember;

import java.util.List;

public interface AccountMemberService {

    // Define methods that will be implemented in the service class
    // For example:
         AccountAdminResponseDTO getMemberById(String id);
         List<AccountAdminResponseDTO> getAllMember();
         AccountAdminResponseDTO createMember(AccountMember obj);
          AccountAdminResponseDTO updateMember(String id, AccountUpdateRequestDTO obj);
          void deactivateMember(String id);

          List<AccountAdminResponseDTO> getAllMemberToSendEmail();
}
