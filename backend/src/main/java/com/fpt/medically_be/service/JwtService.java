package com.fpt.medically_be.service;

public interface JwtService {

    String generateToken(String accountId, String email,String phoneNumber, com.fpt.medically_be.entity.MemberRole role);

}