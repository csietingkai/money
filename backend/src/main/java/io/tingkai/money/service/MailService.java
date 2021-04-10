package io.tingkai.money.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import io.tingkai.money.constant.AppConstants;
import io.tingkai.money.constant.CodeConstants;
import io.tingkai.money.controller.AuthController;
import io.tingkai.money.logging.Loggable;

@Service
@Loggable
public class MailService {

	@Autowired
	private JavaMailSender javaMailSender;

	public void sendConfirmEmail(String destination) {
		// FIXME how to send confirm request
		StringBuilder content = new StringBuilder();
		content.append(CodeConstants.CONFIRM_EMAIL_CONTENT);
		content.append(AppConstants.CONFIRM_EMAIL_LINK);
		content.append(AuthController.CONFIRM_PATH);
		content.append("?");
		content.append(destination);
		sendEmail(CodeConstants.CONFIRM_EMAIL_SUBJECT, content.toString(), destination);
	}

	private void sendEmail(String subject, String content, String... dests) {
		SimpleMailMessage msg = new SimpleMailMessage();
		msg.setTo(dests);

		msg.setSubject(subject);
		msg.setText(content);

		this.javaMailSender.send(msg);
	}
}
