package com.fpt.medically_be.service.impl;

import com.fpt.medically_be.dto.response.VaccineResponse;
import com.fpt.medically_be.mapper.VaccineMapper;
import com.fpt.medically_be.repos.VaccineRepository;
import com.fpt.medically_be.service.VaccineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VaccineServiceImp implements VaccineService {
    @Autowired
    private VaccineRepository vaccineRepository;
    @Autowired
    private VaccineMapper vaccineMapper;

    @Override
    public List<VaccineResponse> getAllVacine() {
        return vaccineRepository.findAll().stream()
                .map(vaccineMapper::toEntityResponse)
                .toList();
    }
}
