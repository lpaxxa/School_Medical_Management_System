package com.fpt.medically_be.base;


import com.fpt.medically_be.entity.Nurse;

public abstract class BaseMapper<EN, DTO> {


    public DTO toObject(EN entity) {
        return null;
    }


    public EN toEntity(DTO dto) {
        return null;
    }

}