package io.tingkai.money.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisPassword;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJacksonJsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import com.fasterxml.jackson.annotation.JsonTypeInfo;

import io.tingkai.money.constant.CodeConstant;
import tools.jackson.databind.DefaultTyping;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;
import tools.jackson.databind.jsontype.BasicPolymorphicTypeValidator;

@Configuration
public class RedisConfig {

	@Value("${spring.redis.money.host}")
	private String host;

	@Value("${spring.redis.money.port}")
	private int port;

	@Value("${spring.redis.money.password}")
	private String password;

	@Value("${spring.redis.money.app.database}")
	private int appDatabase;

	@Value("${spring.redis.money.python.database}")
	private int pythonDatabase;

	@Primary
	@Bean(name = CodeConstant.APP_CACHE)
	public RedisTemplate<?, ?> appCache() {
		return newRedisTemplate(appConnectionFactory());
	}

	@Bean(name = CodeConstant.PYTHON_CACHE)
	public RedisTemplate<?, ?> pythonCache() {
		return newRedisTemplate(pythonConnectionFactory());
	}

	@Primary
	@Bean(name = CodeConstant.APP_CACHE + "_conectionFactory")
	public RedisConnectionFactory appConnectionFactory() {
		return connectionFactory(appDatabase);
	}

	@Bean(name = CodeConstant.PYTHON_CACHE + "_conectionFactory")
	public RedisConnectionFactory pythonConnectionFactory() {
		return connectionFactory(pythonDatabase);
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