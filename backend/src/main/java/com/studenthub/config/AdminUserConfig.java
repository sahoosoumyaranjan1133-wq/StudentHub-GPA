// package com.studenthub.config;

// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.security.core.userdetails.User;
// import org.springframework.security.core.userdetails.UserDetails;
// import org.springframework.security.core.userdetails.UserDetailsService;
// import org.springframework.security.provisioning.InMemoryUserDetailsManager;

// @Configuration
// public class AdminUserConfig {

//     @Bean
//     public UserDetailsService userDetailsService(
//             @Value("${app.admin.username}") String username,
//             @Value("${app.admin.password}") String password) {

//         UserDetails admin = User.withUsername(username)
//                 .password("{noop}" + password)
//                 .roles("ADMIN")
//                 .build();

//         return new InMemoryUserDetailsManager(admin);
//     }
// }
