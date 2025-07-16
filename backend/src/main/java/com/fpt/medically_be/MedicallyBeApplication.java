package com.fpt.medically_be;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@EnableAsync
@SpringBootApplication
public class MedicallyBeApplication {

    public static void main(String[] args) {
        SpringApplication.run(MedicallyBeApplication.class, args);
    }

}
