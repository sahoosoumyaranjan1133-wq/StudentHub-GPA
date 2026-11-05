package com.studenthub.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.studenthub.security.JwtAuthenticationFilter;
import com.studenthub.security.StudentUserDetailsService;

@Configuration
@EnableMethodSecurity
@SuppressWarnings("deprecation")
public class SecurityConfig {

    @Bean("adminAuthenticationManager")
    @Primary
    AuthenticationManager adminAuthenticationManager(
            @Value("${app.admin.username}") String username,
            @Value("${app.admin.password}") String password) {

        UserDetails admin = User.withUsername(username)
                .password(password)
                .roles("ADMIN")
                .build();

        UserDetailsService service =
                new InMemoryUserDetailsManager(admin);

        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider();

        provider.setUserDetailsService(service);
        provider.setPasswordEncoder(NoOpPasswordEncoder.getInstance());

        return new ProviderManager(provider);
    }

    @Bean("studentAuthenticationManager")
    AuthenticationManager studentAuthenticationManager(
            StudentUserDetailsService studentUserDetailsService,
            PasswordEncoder passwordEncoder) {

        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider(passwordEncoder);

        provider.setUserDetailsService(studentUserDetailsService);

        return new ProviderManager(provider);
    }

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            @Qualifier("adminAuthenticationManager")
            AuthenticationManager adminAuthenticationManager,
            JwtAuthenticationFilter jwtAuthenticationFilter)
            throws Exception {

        http
            .authenticationManager(adminAuthenticationManager)
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())

            .authorizeHttpRequests(auth -> auth

                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                .requestMatchers("/actuator/health").permitAll()

                // Public student registration and login
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/students/register",
                    "/api/students/login"
                ).permitAll()

                // Student APIs require authentication
                .requestMatchers("/api/students/**").hasRole("STUDENT")

                // Admin APIs require ADMIN credentials
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                .anyRequest().permitAll()
            )

            .httpBasic(Customizer.withDefaults())

            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOriginPatterns(List.of(
            "https://studenthub-gpa.pages.dev",
            "https://*.studenthub-gpa.pages.dev",
            "http://localhost:5500",
            "http://127.0.0.1:5500"
        ));

        config.setAllowedMethods(List.of(
            "GET", "POST", "PUT", "PATCH",
            "DELETE", "OPTIONS"
        ));

        config.setAllowedHeaders(List.of(
            "Authorization",
            "Content-Type"
        ));

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }
}
