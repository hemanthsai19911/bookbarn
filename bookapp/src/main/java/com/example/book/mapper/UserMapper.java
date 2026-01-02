package com.example.book.mapper;

import com.example.book.dto.UserDto;
import com.example.book.model.User;

public class UserMapper {

    public static UserDto toDto(User u) {
        if (u == null) return null;

        UserDto dto = new UserDto();
        dto.setId(u.getId());
        dto.setUsername(u.getUsername());
        dto.setRole(u.getRole());
        dto.setEmail(u.getEmail());
        dto.setPhone(u.getPhone());
        dto.setAddress(u.getAddress());
        return dto;
    }
}

