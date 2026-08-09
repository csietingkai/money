package io.tingkai.money.model.vo;

import io.tingkai.base.model.vo.Transformable;
import io.tingkai.money.entity.Account;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.jspecify.annotations.Nullable;

@Data
@EqualsAndHashCode(callSuper = false)
public class AccountVo extends Account implements Transformable<Account> {

	@Nullable
	protected String bankName;
	protected boolean removable;
}
