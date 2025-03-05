package io.tingkai.auth.config;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

import io.tingkai.auth.controller.AuthController;
import io.tingkai.auth.security.AuthTokenAuthenticationFilter;
import io.tingkai.auth.security.AuthTokenAuthenticationProvider;

@EnableWebSecurity
@Configuration
public class SecurityConfig {

	@Autowired
	private AuthTokenAuthenticationProvider authAuthenticationProvider;

	@Autowired
	private AuthTokenAuthenticationFilter authTokenAuthenticationFilter;

	@Bean(name = "authenticationManager")
	public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
		return http.getSharedObject(AuthenticationManagerBuilder.class).build();
	}

	@Autowired
	public void configureGlobal(AuthenticationManagerBuilder auth) throws Exception {
		auth.authenticationProvider(authAuthenticationProvider);
	}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		// @formatter:off
		return http
			.csrf(AbstractHttpConfigurer::disable)
			.cors(cors -> cors.configurationSource(request -> {
		        CorsConfiguration configuration = new CorsConfiguration();
		        configuration.setAllowedOrigins(Arrays.asList("*"));
		        configuration.setAllowedMethods(Arrays.asList("*"));
		        configuration.setAllowedHeaders(Arrays.asList("*"));
		        return configuration;
		    }))
			.authorizeHttpRequests(requests ->
				requests.requestMatchers(HttpMethod.POST, AuthController.LOGIN_PATH).permitAll()
					.requestMatchers(HttpMethod.POST, AuthController.REGISTER_PATH).permitAll()
					.requestMatchers(HttpMethod.GET, AuthController.VALIDATE_PATH).permitAll()
					.requestMatchers(HttpMethod.POST, AuthController.LOGOUT_PATH).permitAll()
					.anyRequest().authenticated()
			)
			.sessionManagement(smc -> smc.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
			.addFilterBefore(authTokenAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
			.build();
		// @formatter:on
	}
}
