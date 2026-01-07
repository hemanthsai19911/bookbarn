package com.example.book.service;

import java.io.IOException;
import java.util.List;
import java.nio.charset.StandardCharsets;
import io.jsonwebtoken.security.Keys;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        if (path.startsWith("/user/login") ||
                path.startsWith("/user/register") ||
                path.startsWith("/user/refresh") ||
                path.startsWith("/user/forgot-password") ||
                path.startsWith("/user/reset-password") ||
                path.startsWith("/delivery/login") ||
                path.startsWith("/delivery/register") ||
                path.startsWith("/delivery/forgot-password") ||
                path.startsWith("/delivery/reset-password") ||
                path.startsWith("/vendors/login") ||
                path.startsWith("/vendors/register") ||
                path.startsWith("/vendors/forgot-password") ||
                path.startsWith("/vendors/reset-password") ||
                path.startsWith("/otp/") ||

                path.startsWith("/uploads/")) {
            chain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(Keys.hmacShaKeyFor(JwtService.SECRET.getBytes(StandardCharsets.UTF_8)))
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            String username = claims.getSubject();
            String role = claims.get("role", String.class);

            // Safely extract ID (handles Integer vs Long issue in JWT parsing)
            Number idNum = claims.get("id", Number.class);
            Long userId = (idNum != null) ? idNum.longValue() : null;

            // Add attributes for controllers
            request.setAttribute("username", username);
            request.setAttribute("role", role);
            request.setAttribute("userId", userId);

            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                    username,
                    null,
                    List.of(new SimpleGrantedAuthority("ROLE_" + role)));

            auth.setDetails(
                    new WebAuthenticationDetailsSource().buildDetails(request));

            SecurityContextHolder.getContext().setAuthentication(auth);

        } catch (Exception e) {
            // Token invalid → do NOT authenticate, but allow request to continue
            System.err.println("JWT Verification Failed: " + e.getMessage());
            SecurityContextHolder.clearContext();
        }

        chain.doFilter(request, response);
    }
}
