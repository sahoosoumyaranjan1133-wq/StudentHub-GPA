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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.studenthub.security.StudentUserDetailsService;

@Configuration
@EnableMethodSecurity
@SuppressWarnings("deprecation")
public class SecurityConfig {

    @Value("${app.cors.allowed-origin:http://127.0.0.1:5500}")
    private String allowedOrigin;

    // Admin authentication
    // @Bean("adminAuthenticationManager")
    // @Primary
    // AuthenticationManager adminAuthenticationManager(
    //         @Value("${app.admin.username}") String username,
    //         @Value("${app.admin.password}") String password) {

    //     UserDetails admin = User.withUsername(username)
    //             .password("{noop}" + password)
    //             .roles("ADMIN")
    //             .build();

    //     UserDetailsService adminUserDetailsService =
    //             new InMemoryUserDetailsManager(admin);

    //     DaoAuthenticationProvider provider =
    //             new DaoAuthenticationProvider(adminUserDetailsService);

    //     provider.setPasswordEncoder(
    //             NoOpPasswordEncoder.getInstance());

    //     return new ProviderManager(provider);
    // }
    @Bean("adminAuthenticationManager")
@Primary
AuthenticationManager adminAuthenticationManager(
        @Value("${app.admin.username}") String username,
        @Value("${app.admin.password}") String password) {

    UserDetails admin = User.withUsername(username)
            .password(password)
            .roles("ADMIN")
            .build();

    UserDetailsService adminUserDetailsService =
            new InMemoryUserDetailsManager(admin);

    DaoAuthenticationProvider provider =
            new DaoAuthenticationProvider();

    provider.setUserDetailsService(adminUserDetailsService);
    provider.setPasswordEncoder(NoOpPasswordEncoder.getInstance());

    return new ProviderManager(provider);
}

    // Security rules for HTTP requests
//     @Bean
//     SecurityFilterChain securityFilterChain(
//             HttpSecurity http,
//             @Qualifier("adminAuthenticationManager")
//             AuthenticationManager adminAuthenticationManager)
//             throws Exception {

//         http
//             // .authenticationManager(adminAuthenticationManager)
//             // .cors(Customizer.withDefaults())
//             // .csrf(csrf -> csrf.disable())
//             // .authorizeHttpRequests(auth -> auth
//             //     .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
//             //     .requestMatchers(
//             //         HttpMethod.POST,
//             //         "/api/students/register",
//             //         "/api/students/login"
//             //     ).permitAll()
//             //     .anyRequest().hasRole("ADMIN")
//             // )
//             .authorizeHttpRequests(auth -> auth
//     .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

//     // Public health check
//     .requestMatchers("/actuator/health").permitAll()

//     // Public student registration and login
//     .requestMatchers(
//         HttpMethod.POST,
//         "/api/students/register",
//         "/api/students/login"
//     ).permitAll()

//     // All remaining endpoints require ADMIN
//     .anyRequest().hasRole("ADMIN")
// )
//             .httpBasic(Customizer.withDefaults());

//         return http.build();
//     }
@Bean
SecurityFilterChain securityFilterChain(
        HttpSecurity http,
        @Qualifier("adminAuthenticationManager")
        AuthenticationManager adminAuthenticationManager)
        throws Exception {

    // http
    //     .cors(Customizer.withDefaults())
    http
    .authenticationManager(adminAuthenticationManager)

    .cors(Customizer.withDefaults())

        // Disable CSRF for this REST API
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

            // Other endpoints require ADMIN
            .anyRequest().hasRole("ADMIN")
        )

        .httpBasic(Customizer.withDefaults());

    return http.build();
}

    // Student authentication
    // @Bean("studentAuthenticationManager")
    // AuthenticationManager studentAuthenticationManager(
    //         StudentUserDetailsService studentUserDetailsService,
    //         PasswordEncoder passwordEncoder) {

    //     DaoAuthenticationProvider provider =
    //             new DaoAuthenticationProvider(studentUserDetailsService);

    //     provider.setPasswordEncoder(passwordEncoder);

    //     return new ProviderManager(provider);
    // }
    @Bean("studentAuthenticationManager")
AuthenticationManager studentAuthenticationManager(
        StudentUserDetailsService studentUserDetailsService,
        PasswordEncoder passwordEncoder) {

    DaoAuthenticationProvider provider =
            new DaoAuthenticationProvider(passwordEncoder);

    provider.setUserDetailsService(studentUserDetailsService);

    return new ProviderManager(provider);
}

    // CORS configuration for the frontend
// @Bean
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

