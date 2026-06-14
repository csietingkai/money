package io.tingkai.auth.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisPassword;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJacksonJsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import com.fasterxml.jackson.annotation.JsonTypeInfo;

import io.tingkai.auth.constant.AuthConstant;
import tools.jackson.databind.DefaultTyping;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;
import tools.jackson.databind.jsontype.BasicPolymorphicTypeValidator;

@Configuration
public class AuthRedisConfig {

	@Value("${spring.redis.auth.host}")
	private String host;

	@Value("${spring.redis.auth.port}")
	private int port;

	@Value("${spring.redis.auth.password}")
	private String password;

	@Value("${spring.redis.auth.database}")
	private int database;

	@Bean(name = AuthConstant.AUTH_CACHE)
	public RedisTemplate<?, ?> userCache() {
		return newRedisTemplate(authConnectionFactory());
	}

	@Bean(name = AuthConstant.AUTH_CACHE + "_conectionFactory")
	public RedisConnectionFactory authConnectionFactory() {
		return connectionFactory(database);
	}

	private RedisTemplate<byte[], byte[]> newRedisTemplate(RedisConnectionFactory connectionFactory) {
		RedisTemplate<byte[], byte[]> template = new RedisTemplate<>();
		template.setConnectionFactory(connectionFactory);
		ObjectMapper objectMapper = JsonMapper.builder().activateDefaultTyping(BasicPolymorphicTypeValidator.builder().allowIfSubType(Object.class).build(), DefaultTyping.NON_FINAL, JsonTypeInfo.As.PROPERTY).build();
		template.setKeySerializer(new StringRedisSerializer());
		template.setValueSerializer(new GenericJacksonJsonRedisSerializer(objectMapper));
		template.setHashKeySerializer(new StringRedisSerializer());
		template.setHashValueSerializer(new GenericJacksonJsonRedisSerializer(objectMapper));
		return template;
	}

	private RedisConnectionFactory connectionFactory(int database) {
		RedisStandaloneConfiguration redisStandaloneConfiguration = new RedisStandaloneConfiguration(host, port);
		redisStandaloneConfiguration.setPassword(RedisPassword.of(password));
		redisStandaloneConfiguration.setDatabase(database);
		return new LettuceConnectionFactory(redisStandaloneConfiguration);
	}
}