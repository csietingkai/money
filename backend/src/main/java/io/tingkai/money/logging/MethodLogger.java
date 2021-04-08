package io.tingkai.money.logging;

import java.text.MessageFormat;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.event.Level;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

@Aspect
@Component
@Slf4j
public class MethodLogger {

	private static final String LOGGING_MESSAGE_FORMAT = "### {0}({1}): {2} in {3} milliseconds";

	@Pointcut("execution(* (@Loggable *).*(..))")
	protected void methodOfAnnotatedClass() {
	}

	@Around("methodOfAnnotatedClass() && @within(loggable)")
	public Object around(ProceedingJoinPoint point, Loggable loggable) throws Throwable {
		long start = System.currentTimeMillis();
		Object result = point.proceed();
		long spentTime = System.currentTimeMillis() - start;

		String methodName = MethodSignature.class.cast(point.getSignature()).getMethod().getName();
		Object args = point.getArgs();
		this.loggingOut(loggable.level(), MessageFormat.format(LOGGING_MESSAGE_FORMAT, methodName, args, result, spentTime));
		return result;
	}

	private void loggingOut(Level level, String message) {
		switch (level) {
		case TRACE:
			log.trace(message);
			break;
		case INFO:
			log.info(message);
			break;
		case WARN:
			log.warn(message);
			break;
		case ERROR:
			log.error(message);
			break;
		case DEBUG:
		default:
			log.debug(message);
			break;
		}
	}
}
