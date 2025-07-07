package com.fpt.medically_be.service;

import com.fpt.medically_be.dto.response.VaccineResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface VaccineService {

    List<VaccineResponse> getAllVacine();

}
