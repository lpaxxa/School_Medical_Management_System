package com.fpt.medically_be.mapper;

import com.fpt.medically_be.dto.request.AccountUpdateRequestDTO;
import com.fpt.medically_be.dto.response.AccountAdminResponseDTO;
import com.fpt.medically_be.entity.AccountMember;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface AccountMemberMapper {

    AccountAdminResponseDTO memberToMemberDTO(AccountMember member);

    void updateAccountMember(@MappingTarget AccountMember obj, AccountUpdateRequestDTO obj2);

}
