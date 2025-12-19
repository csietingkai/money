package io.tingkai.base.util;

import java.text.MessageFormat;
import java.util.Collections;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.ResourceBundle;

import io.tingkai.base.enumeration.Lang;

public class I18nUtil {

	private static final Map<Lang, ResourceBundle> BUNDLES;

	static {
		Map<Lang, ResourceBundle> bundles = new HashMap<>();
		for (Lang l : Lang.values()) {
			bundles.put(l, ResourceBundle.getBundle("locale.message", new Locale(l.name())));
		}
		BUNDLES = Collections.unmodifiableMap(bundles);
	}

	public static String getMessage(Lang lang, String key) {
		return BUNDLES.get(lang).getString(key);
	}

	public static String getMessage(Lang lang, String key, Object... arguments) {
		return MessageFormat.format(getMessage(lang, key), arguments);
	}
}
