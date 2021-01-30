package io.tingkai.money.security;

import java.io.IOException;
import java.util.Date;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.GenericFilterBean;

import io.tingkai.money.constant.CodeConstants;
import io.tingkai.money.enumeration.Role;
import lombok.extern.slf4j.Slf4j;

/**
 * Filter Layer of Spring, filter token string send with request is passed or
 * not.
 * 
 * @author tingkai
 */
@Slf4j
@Component
public class AuthTokenAuthenticationFilter extends GenericFilterBean {

	@Autowired
	protected AuthenticationManager authenticationManager;

	@Override
	public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws IOException, ServletException {
		HttpServletRequest request = (HttpServletRequest) req;
		HttpServletResponse response = (HttpServletResponse) res;
		response.setHeader("Access-Control-Allow-Origin", "*");
		response.setHeader("Access-Control-Allow-Methods", "POST, PUT, GET, OPTIONS, DELETE");
		response.setHeader("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, observe, " + CodeConstants.REQUEST_TOKEN_KEY);
		response.setHeader("Access-Control-Max-Age", "3600");
		response.setHeader("Access-Control-Allow-Credentials", "true");
		if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
			response.setStatus(HttpServletResponse.SC_OK);
		} else {
			String authTokenString = request.getHeader(CodeConstants.REQUEST_TOKEN_KEY);
			if (authTokenString != null) {
				AuthTokenAuthentication authTokenAuthentication = new AuthTokenAuthentication(authTokenString);
				try {
					Authentication authentication = this.authenticationManager.authenticate(authTokenAuthentication);
					Object detail = authentication.getDetails();
					if (detail instanceof AuthToken && Role.NONE != ((AuthToken) detail).getRole() && ((AuthToken) detail).getExpiryDate().after(new Date())) {
						SecurityContextHolder.getContext().setAuthentication(authentication);
					} else {
						SecurityContextHolder.getContext().setAuthentication(null);
					}
				} catch (AuthenticationException e) {
					SecurityContextHolder.getContext().setAuthentication(null);
					log.info(e.getMessage() + "tokenString: " + authTokenString);
				}
			} else {
				SecurityContextHolder.getContext().setAuthentication(null);
			}

			chain.doFilter(req, res);
		}
	}
}
