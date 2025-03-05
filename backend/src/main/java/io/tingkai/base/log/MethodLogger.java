package io.tingkai.base.log;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.event.Level;
import org.springframework.stereotype.Component;

import io.tingkai.base.util.BaseAppUtil;
import lombok.extern.slf4j.Slf4j;

@Aspect
@Component
@Slf4j
public class MethodLogger {

	private static String LOG_PATTERN = "### %s.%s(%s) in %d milliseconds.";

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
		loggingOut(loggable.level(), composeMessage(className, methodName, args, spentTime));
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
		String[] argStrs = new String[args.length];
		for (int argsCnt = 0; argsCnt < args.length; argsCnt++) {
			if (BaseAppUtil.isPresent(args[argsCnt])) {
				argStrs[argsCnt] = args[argsCnt].toString();
			} else {
				argStrs[argsCnt] = "null";
			}
		}
		return String.format(LOG_PATTERN, className, methodName, String.join(", ", argStrs), spentTime);
	}
}
