package com.example.book.service;

import java.util.Date;

import org.springframework.stereotype.Service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

@Service
public class JwtService {

    public static final String SECRET = "hfuybiehv7812bjhjhdfhvjkdKJHJsdfghsdfjkhfdV8785485412";
    private static final String refreshSecret = "xgdhxgfdburiuewuioeuyuewihiegf7326034jvhroe48n43u8943nu43";

    @SuppressWarnings("deprecation")
    public static String generateToken(Long id, String username, String role) {
        return Jwts.builder()
                .setSubject(username)
                .claim("id", id)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24)) // 24 hours
                .signWith(SignatureAlgorithm.HS256, SECRET)
                .compact();
    }

    @SuppressWarnings("deprecation")
    public String extractUsername(String token) {
        return Jwts.parser()
                .setSigningKey(SECRET)
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public static String generateRefreshToken(Long id, String username) {
        return Jwts.builder()
                .setSubject(username)
                .claim("id", id)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 7 * 24 * 60 * 60 * 1000)) // 7 days
                .signWith(SignatureAlgorithm.HS256, refreshSecret)
                .compact();
    }

    public static String validateRefreshToken(String token) {
        return Jwts.parser()
                .setSigningKey(refreshSecret)
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

}