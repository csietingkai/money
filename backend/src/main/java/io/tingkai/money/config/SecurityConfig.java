package io.tingkai.money.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import io.tingkai.money.controller.AuthController;
import io.tingkai.money.security.AuthTokenAuthenticationFilter;
import io.tingkai.money.security.AuthTokenAuthenticationProvider;

/**
 * Setting for login token, create filter to block requests without tokenString
 * 
 * @author tingkai
 */
@EnableWebSecurity
@Configuration
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig extends WebSecurityConfigurerAdapter {

	@Autowired
	private AuthTokenAuthenticationProvider authAuthenticationProvider;

	@Autowired
	private AuthTokenAuthenticationFilter authTokenAuthenticationFilter;

	@Bean(name = "authenticationManager")
	@Override
	public AuthenticationManager authenticationManagerBean() throws Exception {
		return super.authenticationManagerBean();
	}

	@Autowired
	public void configureGlobal(AuthenticationManagerBuilder auth) throws Exception {
		auth.authenticationProvider(this.authAuthenticationProvider);
	}

	@Override
	protected void configure(HttpSecurity http) throws Exception {
		// @formatter:off
		http.csrf().disable()
			.authorizeRequests()
			.antMatchers(AuthController.LOGIN_PATH, AuthController.REGISTER_PATH, AuthController.CONFIRM_PATH, AuthController.VALIDATE_PATH).permitAll()
			.anyRequest().authenticated().and()
			.sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);
		// @formatter:on
		http.addFilterBefore(this.authTokenAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
	}
}
