package io.tingkai.money.logging;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.event.Level;
import org.springframework.stereotype.Component;

import io.tingkai.money.util.AppUtil;
import lombok.extern.slf4j.Slf4j;

@Aspect
@Component
@Slf4j
public class MethodLogger {

	@Pointcut("execution(* (@Loggable *).*(..))")
	protected void methodOfAnnotatedClass() {
	}

	@Around("methodOfAnnotatedClass() && @within(loggable)")
	public Object around(ProceedingJoinPoint point, Loggable loggable) throws Throwable {
		long start = System.currentTimeMillis();
		Object result = point.proceed();
		long spentTime = System.currentTimeMillis() - start;
		String className = point.getTarget().getClass().getSimpleName();
		String methodName = MethodSignature.class.cast(point.getSignature()).getMethod().getName();
		Object[] args = point.getArgs();
		this.loggingOut(loggable.level(), this.composeMessage(className, methodName, args, spentTime));
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

	private String composeMessage(String className, String methodName, Object[] args, long spentTime) {
		StringBuilder messageBuilder = new StringBuilder();
		messageBuilder.append("### ");
		messageBuilder.append(className);
		messageBuilder.append(".");
		messageBuilder.append(methodName);
		messageBuilder.append("(");
		for (int argsCnt = 0; argsCnt < args.length; argsCnt++) {
			if (AppUtil.isPresent(args[argsCnt])) {
				messageBuilder.append(args[argsCnt].toString());
			} else {
				messageBuilder.append("null");
			}
			if (argsCnt != args.length - 1) {
				messageBuilder.append(", ");
			}
		}
		messageBuilder.append(") in ");
		messageBuilder.append(spentTime);
		messageBuilder.append(" milliseconds");
		return messageBuilder.toString();
	}
}
