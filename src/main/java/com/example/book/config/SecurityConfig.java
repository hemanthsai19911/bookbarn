package com.example.book.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.security.config.Customizer;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.example.book.service.JwtFilter;

@Configuration
public class SecurityConfig {

	private final JwtFilter jwtFilter;

	public SecurityConfig(JwtFilter jwtFilter) {
		System.out.println("SecurityConfig loaded! Admin updates permitted.");
		this.jwtFilter = jwtFilter;
	}

	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

		http.csrf(csrf -> csrf.disable());
		http.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

		http.authorizeHttpRequests(auth -> auth

				// ---------- PUBLIC ----------
				.requestMatchers("/user/login", "/user/register", "/user/refresh", "/user/forgot-password",
						"/user/reset-password",
						"/delivery/login", "/delivery/register", "/delivery/refresh", "/delivery/forgot-password",
						"/delivery/reset-password",
						"/vendors/register", "/vendors/login", "/vendors/forgot-password", "/vendors/reset-password",
						"/otp/**",
						"/ws/**",
						"/error")
				.permitAll()
				.requestMatchers(HttpMethod.GET, "/books").permitAll()
				.requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()
				.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // Allow preflight checks
				// ---------- ADMIN ----------
				.requestMatchers("/admin/**").hasRole("ADMIN")
				.requestMatchers(HttpMethod.POST, "/books/**").hasAnyRole("ADMIN", "VENDOR")
				.requestMatchers(HttpMethod.PUT, "/books/**").hasAnyRole("ADMIN", "VENDOR")
				.requestMatchers(HttpMethod.DELETE, "/books/**").hasAnyRole("ADMIN", "VENDOR")

				.requestMatchers(HttpMethod.GET, "/users").hasRole("ADMIN")
				.requestMatchers(HttpMethod.DELETE, "/user/**", "/delivery/**").hasRole("ADMIN")

				.requestMatchers("/admin/vendors/**").hasRole("ADMIN")

				// ---------- AUTHENTICATED USERS ----------
				.requestMatchers("/user/me").hasAnyRole("USER", "ADMIN")
				.requestMatchers(HttpMethod.PUT, "/user/*/update-profile").hasAnyRole("USER", "ADMIN")
				.requestMatchers("/notifications/**").hasAnyRole("VENDOR", "ADMIN")

				// agent endpoints -> require DELIVERY_AGENT role
				.requestMatchers("/delivery/login", "/delivery/register").permitAll()
				.requestMatchers("/delivery/**").hasRole("DELIVERY_AGENT")

				// ---------- ORDERS / CART ----------
				.requestMatchers("/orders/delivery/**", "/orders/assign-agent").hasAnyRole("DELIVERY_AGENT", "ADMIN")
				.requestMatchers("/orders/vendor/**").hasAnyRole("VENDOR", "ADMIN")
				.requestMatchers("/orders/update-status").hasAnyRole("VENDOR", "DELIVERY_AGENT", "ADMIN")
				.requestMatchers("/orders/place").hasAnyRole("USER", "ADMIN")
				.requestMatchers("/orders/user/**").hasAnyRole("USER", "ADMIN")
				.requestMatchers("/orders/{orderId}").authenticated()
				.requestMatchers("/orders").hasRole("ADMIN")
				.requestMatchers("/cart", "/cart/**").hasAnyRole("USER", "ADMIN")

				// ---------- EVERYTHING ELSE ----------
				.anyRequest().authenticated());

		http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

		// Use the Bean defined below
		http.cors(Customizer.withDefaults());

		return http.build();
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();
		configuration.setAllowedOrigins(
				java.util.List.of("http://localhost:5173", "http://localhost:3000", "https://bookbarnkhs.netlify.app",
						"https://cute-tanuki-467368.netlify.app", "https://admirable-tartufo-25dd3e.netlify.app"));
		configuration.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
		configuration.setAllowedHeaders(java.util.List.of("*"));
		configuration.setAllowCredentials(true);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
		return config.getAuthenticationManager();
	}
}
