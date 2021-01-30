package io.tingkai.money.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import io.tingkai.money.constant.AppConstants;

/**
 * Simple configuration for spring, currently only provide
 * {@link PasswordEncoder}
 * 
 * @author tingkai
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public WebMvcConfigurer corsConfigurer() {
		return new WebMvcConfigurer() {
			@Override
			public void addCorsMappings(CorsRegistry registry) {
				registry.addMapping("/*").allowedOrigins(AppConstants.FRONTEND_URL).allowedMethods("*");
			}
		};
	}

	@Bean
	public RestTemplate pythonServer(RestTemplateBuilder builder) {
		return builder.build();
	}
}