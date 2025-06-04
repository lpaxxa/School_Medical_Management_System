package com.fpt.medically_be.service.impl;

import com.fpt.medically_be.dto.ParentDTO;
import com.fpt.medically_be.entity.AccountMember;
import com.fpt.medically_be.entity.Parent;
import com.fpt.medically_be.repos.AccountMemberRepos;
import com.fpt.medically_be.repos.ParentRepository;
import com.fpt.medically_be.service.ParentService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ParentServiceImpl implements ParentService {

    private final ParentRepository parentRepository;
    private final AccountMemberRepos accountMemberRepos;

    @Autowired
    public ParentServiceImpl(ParentRepository parentRepository, AccountMemberRepos accountMemberRepos) {
        this.parentRepository = parentRepository;
        this.accountMemberRepos = accountMemberRepos;
    }

    @Override
    public List<ParentDTO> getAllParents() {
        return parentRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ParentDTO getParentById(Long id) {
        return parentRepository.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy phụ huynh với ID: " + id));
    }

    @Override
    public ParentDTO getParentByEmail(String email) {
        return parentRepository.findByEmail(email)
                .map(this::convertToDTO)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy phụ huynh với email: " + email));
    }

    @Override
    public ParentDTO getParentByPhoneNumber(String phoneNumber) {
        return parentRepository.findByPhoneNumber(phoneNumber)
                .map(this::convertToDTO)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy phụ huynh với số điện thoại: " + phoneNumber));
    }

    @Override
    public ParentDTO getParentByAccountId(String accountId) {
        return parentRepository.findByAccountId(accountId)
                .map(this::convertToDTO)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy phụ huynh với ID tài khoản: " + accountId));
    }

    @Override
    public ParentDTO createParent(ParentDTO parentDTO) {
        Parent parent = convertToEntity(parentDTO);
        Parent savedParent = parentRepository.save(parent);
        return convertToDTO(savedParent);
    }

    @Override
    public ParentDTO updateParent(Long id, ParentDTO parentDTO) {
        Parent existingParent = parentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy phụ huynh với ID: " + id));

        // Cập nhật thông tin phụ huynh
        existingParent.setFullName(parentDTO.getFullName());
        existingParent.setPhoneNumber(parentDTO.getPhoneNumber());
        existingParent.setEmail(parentDTO.getEmail());
        existingParent.setAddress(parentDTO.getAddress());
        existingParent.setRelationshipType(parentDTO.getRelationshipType());

        // Cập nhật tài khoản nếu có
        // Nếu accountId không null và
        // khác với tài khoản hiện tại của phụ huynh, cập nhật tài khoản
        if (parentDTO.getAccountId() != null && !parentDTO.getAccountId().equals(existingParent.getAccount() != null ? existingParent.getAccount().getId() : null)) {
            // Lấy đối tượng AccountMember mới từ DB.
            // Nếu tìm thấy, gán lại vào existingParent.
            AccountMember account = accountMemberRepos.findById(parentDTO.getAccountId())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy tài khoản với ID: " + parentDTO.getAccountId()));
            existingParent.setAccount(account);
        }

        Parent updatedParent = parentRepository.save(existingParent);
        return convertToDTO(updatedParent);
    }

    @Override
    public void deleteParent(Long id) {
        if (!parentRepository.existsById(id)) {
            throw new EntityNotFoundException("Không tìm thấy phụ huynh với ID: " + id);
        }
        parentRepository.deleteById(id);
    }

    // Phương thức chuyển đổi từ Entity sang DTO
    private ParentDTO convertToDTO(Parent parent) {
        ParentDTO dto = new ParentDTO();
        dto.setId(parent.getId());
        dto.setFullName(parent.getFullName());
        dto.setPhoneNumber(parent.getPhoneNumber());
        dto.setEmail(parent.getEmail());
        dto.setAddress(parent.getAddress());
        dto.setRelationshipType(parent.getRelationshipType());

        if (parent.getAccount() != null) {
            dto.setAccountId(parent.getAccount().getId());
        }

        return dto;
    }

    // Phương thức chuyển đổi từ DTO sang Entity
    private Parent convertToEntity(ParentDTO dto) {
        Parent parent = new Parent();
        parent.setId(dto.getId());
        parent.setFullName(dto.getFullName());
        parent.setPhoneNumber(dto.getPhoneNumber());
        parent.setEmail(dto.getEmail());
        parent.setAddress(dto.getAddress());
        parent.setRelationshipType(dto.getRelationshipType());

        // Thiết lập tài khoản nếu có
        if (dto.getAccountId() != null) {
            accountMemberRepos.findById(dto.getAccountId())
                    .ifPresent(parent::setAccount);
        }

        return parent;
    }
}
