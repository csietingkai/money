package io.tingkai.money.model.vo;

import io.tingkai.money.entity.Account;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = false)
public class AccountVo extends Account implements Transformable<Account> {

	protected boolean removable;
}
