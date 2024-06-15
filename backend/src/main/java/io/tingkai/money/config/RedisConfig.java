package io.tingkai.money.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.connection.RedisPassword;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;

import io.tingkai.money.constant.CodeConstants;

@Configuration
public class RedisConfig {

	@Value("${spring.redis.host}")
	private String host;

	@Value("${spring.redis.port}")
	private int port;

	@Value("${spring.redis.password}")
	private String password;

	@Value("${spring.redis.database}")
	private int database;

	@Value("${spring.redis.python-database}")
	private int pythonDatabase;

	@Value("${spring.redis.user-database}")
	private int userDatabase;

	@Bean(name = CodeConstants.APP_CACHE)
	@Primary
	public RedisTemplate<?, ?> appCache() {
		return this.newRedisTemplate(appConnectionFactory());
	}

	@Bean(name = CodeConstants.PYTHON_CACHE)
	public RedisTemplate<?, ?> pythonCache() {
		return this.newRedisTemplate(pythonConnectionFactory());
	}

	@Bean(name = CodeConstants.USER_CACHE)
	public RedisTemplate<?, ?> userCache() {
		return this.newRedisTemplate(userConnectionFactory());
	}

	@Bean(name = CodeConstants.APP_CACHE + "_conectionFactory")
	@Primary
	public LettuceConnectionFactory appConnectionFactory() {
		return this.connectionFactory(database);
	}

	@Bean(name = CodeConstants.PYTHON_CACHE + "_conectionFactory")
	public LettuceConnectionFactory pythonConnectionFactory() {
		return this.connectionFactory(pythonDatabase);
	}

	@Bean(name = CodeConstants.USER_CACHE + "_conectionFactory")
	public LettuceConnectionFactory userConnectionFactory() {
		return this.connectionFactory(userDatabase);
	}

	private RedisTemplate<byte[], byte[]> newRedisTemplate(LettuceConnectionFactory connectionFactory) {
		RedisTemplate<byte[], byte[]> template = new RedisTemplate<>();
		template.setConnectionFactory(connectionFactory);
		ObjectMapper objectMapper = new ObjectMapper();
		objectMapper.activateDefaultTyping(LaissezFaireSubTypeValidator.instance, ObjectMapper.DefaultTyping.NON_FINAL, JsonTypeInfo.As.PROPERTY);
		template.setKeySerializer(new StringRedisSerializer());
		template.setValueSerializer(new Jackson2JsonRedisSerializer<>(objectMapper, Object.class));
		template.setHashKeySerializer(new StringRedisSerializer());
		template.setHashValueSerializer(new GenericJackson2JsonRedisSerializer());
		return template;
	}

	private LettuceConnectionFactory connectionFactory(int database) {
		RedisStandaloneConfiguration redisStandaloneConfiguration = new RedisStandaloneConfiguration(host, port);
		redisStandaloneConfiguration.setPassword(RedisPassword.of(password));
		redisStandaloneConfiguration.setDatabase(database);
		return new LettuceConnectionFactory(redisStandaloneConfiguration);
	}
}