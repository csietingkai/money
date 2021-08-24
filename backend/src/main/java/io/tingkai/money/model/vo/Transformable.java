package io.tingkai.money.model.vo;

import org.springframework.beans.BeanUtils;

public interface Transformable<Entity> {

	public default void transform(Entity entity) {
		BeanUtils.copyProperties(entity, this);
	}
}
