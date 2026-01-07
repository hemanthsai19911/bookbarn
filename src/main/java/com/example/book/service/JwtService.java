package com.example.book.service;

import java.util.Date;

import org.springframework.stereotype.Service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

import java.security.Key;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;

@Service
public class JwtService {

    public static final String SECRET = "hfuybiehv7812bjhjhdfhvjkdKJHJsdfghsdfjkhfdV8785485412";
    private static final String refreshSecret = "xgdhxgfdburiuewuioeuyuewihiegf7326034jvhroe48n43u8943nu43";

    private static Key getSigningKey(String secret) {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public static String generateToken(Long id, String username, String role) {
        return Jwts.builder()
                .setSubject(username)
                .claim("id", id)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24)) // 24 hours
                .signWith(getSigningKey(SECRET), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractUsername(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey(SECRET))
                .build()
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
                .signWith(getSigningKey(refreshSecret), SignatureAlgorithm.HS256)
                .compact();
    }

    public static String validateRefreshToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey(refreshSecret))
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

}