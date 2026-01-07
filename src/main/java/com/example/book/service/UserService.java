package com.example.book.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.book.dto.UserDto;
import com.example.book.mapper.UserMapper;
import com.example.book.model.DeliveryAgent;
import com.example.book.model.User;
import com.example.book.repository.DeliveryAgentRepository;
import com.example.book.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository urepo;
    private final DeliveryAgentRepository drepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public UserService(UserRepository urepo, DeliveryAgentRepository drepo) {
        this.urepo = urepo;
        this.drepo = drepo;
    }

    // ---------------- Public helpers ----------------

    public List<User> findAll() {
        return urepo.findAll();
    }

    public Optional<User> findById(Long id) {
        return urepo.findById(id);
    }

    /**
     * Find single user by username.
     * Some repos return List<User> for username; pick the first one.
     */
    public User findByUsernameSingle(String username) {
        if (username == null)
            return null;
        List<User> list = urepo.findByUsername(username);
        return (list == null || list.isEmpty()) ? null : list.get(0);
    }

    public User findByEmail(String email) {
        return urepo.findByEmail(email);
    }

    public User findByPhone(String phone) {
        return urepo.findByPhone(phone);
    }

    // ---------------- Registration ----------------
    /**
     * Register either normal user/admin or delivery agent based on role in DTO.
     * Returns saved entity (User or DeliveryAgent).
     */
    public Object register(UserDto req) {
        if (req == null)
            throw new RuntimeException("Invalid request");

        String role = (req.getRole() == null) ? "USER" : req.getRole().toUpperCase();

        if ("DELIVERY_AGENT".equals(role)) {
            DeliveryAgent d = new DeliveryAgent();
            d.setName(req.getUsername());
            d.setEmail(req.getEmail());
            d.setPhone(req.getPhone());
            d.setArea(req.getArea());
            d.setPassword(passwordEncoder.encode(req.getPassword()));
            d.setStatus("ACTIVE");
            return drepo.save(d);
        }

        // normal user or admin
        User u = new User();
        u.setUsername(req.getUsername());
        u.setEmail(req.getEmail());
        u.setPhone(req.getPhone());
        u.setRole(role);
        u.setPassword(passwordEncoder.encode(req.getPassword()));
        return urepo.save(u);
    }

    // ---------------- Login ----------------
    /**
     * Login using input (email | phone | username) and password.
     * Returns a map containing user DTO, accessToken, refreshToken.
     */
    public Map<String, Object> login(String input, String password) {
        if (input == null || password == null)
            throw new RuntimeException("input and password required");

        User user = null;

        // try email
        user = urepo.findByEmail(input);
        if (user != null) {
            if (passwordEncoder.matches(password, user.getPassword()))
                return buildAuthResponse(user);
            throw new RuntimeException("Invalid password");
        }

        // try phone
        user = urepo.findByPhone(input);
        if (user != null) {
            if (passwordEncoder.matches(password, user.getPassword()))
                return buildAuthResponse(user);
            throw new RuntimeException("Invalid password");
        }

        // try username (repo returns list)
        List<User> users = urepo.findByUsername(input);
        if (users != null && !users.isEmpty()) {
            for (User u : users) {
                if (passwordEncoder.matches(password, u.getPassword())) {
                    return buildAuthResponse(u);
                }
            }
            throw new RuntimeException("Invalid password");
        }

        throw new RuntimeException("User not found");
    }

    private Map<String, Object> buildAuthResponse(User user) {
        String access = JwtService.generateToken(user.getId(), user.getUsername(), user.getRole());
        String refresh = JwtService.generateRefreshToken(user.getId(), user.getUsername());

        Map<String, Object> resp = new HashMap<>();
        resp.put("user", UserMapper.toDto(user));
        resp.put("accessToken", access);
        resp.put("refreshToken", refresh);
        return resp;
    }

    // ---------------- Update profile ----------------
    public User updateProfile(Long id, User updated) {
        User existing = urepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Basic safe updates with duplicate checks
        if (updated.getEmail() != null && !updated.getEmail().equals(existing.getEmail())) {
            if (urepo.existsByEmail(updated.getEmail()))
                throw new RuntimeException("Email already exists");
            existing.setEmail(updated.getEmail());
        }

        if (updated.getPhone() != null && !updated.getPhone().equals(existing.getPhone())) {
            if (urepo.existsByPhone(updated.getPhone()))
                throw new RuntimeException("Phone number already exists");
            existing.setPhone(updated.getPhone());
        }

        if (updated.getUsername() != null && !updated.getUsername().equals(existing.getUsername())) {
            List<User> found = urepo.findByUsername(updated.getUsername());
            if (found != null && !found.isEmpty())
                throw new RuntimeException("Username already exists");
            existing.setUsername(updated.getUsername());
        }

        if (updated.getAddress() != null) {
            existing.setAddress(updated.getAddress());
        }

        if (updated.getPassword() != null && !updated.getPassword().isBlank()) {
            existing.setPassword(passwordEncoder.encode(updated.getPassword()));
        }

        return urepo.save(existing);
    }

    // ---------------- Delete ----------------
    public void delete(Long id) {
        urepo.deleteById(id);
    }
}
