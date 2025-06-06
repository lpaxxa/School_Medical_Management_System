package com.fpt.medically_be.exception;

import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {


    // xử lý runtime exception
    @ExceptionHandler(value = RuntimeException.class)// class muốn bắt lỗi
    ResponseEntity<String> handleRuntimeException(RuntimeException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }

    // xử lý các lỗi trong object user,@NotNull,@Email(không đúng định dạng) , @Pattern, @Size(min=, max=)
    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    ResponseEntity<String> handleMethodArgumentNotValidException(MethodArgumentNotValidException e) {
        return ResponseEntity.badRequest().body(e.getFieldError().getDefaultMessage());
    }

    // xử lý lỗi của nhập sai format date
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<String> handleInvalidFormat(HttpMessageNotReadableException ex) {
        if (ex.getCause() instanceof InvalidFormatException) {
            return ResponseEntity.badRequest().body("Invalid date format. Please use yyyy-MM-dd");
        }
        return ResponseEntity.badRequest().body("Malformed JSON request");
    }





}
