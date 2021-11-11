CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
	id uuid NOT NULL DEFAULT uuid_generate_v4(),
	name VARCHAR NOT NULL UNIQUE,
	email VARCHAR NOT NULL UNIQUE,
	pwd VARCHAR NOT NULL,
	role VARCHAR NOT NULL,
	confirm BOOLEAN DEFAULT false NOT NULL,
	PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS exchange_rate (
	currency VARCHAR NOT NULL,
	name VARCHAR NOT NULL,
	PRIMARY KEY (currency)
);

CREATE TABLE IF NOT EXISTS exchange_rate_record (
	id uuid NOT NULL DEFAULT uuid_generate_v4(),
	currency VARCHAR NOT NULL,
	date TIMESTAMP NOT NULL,
	cash_buy NUMERIC, --現金匯率_本行買入
	cash_sell NUMERIC, --現金匯率_本行賣出
	spot_buy NUMERIC, --即期匯率_本行買入
	spot_sell NUMERIC, --即期匯率_本行賣出
	PRIMARY KEY (id),
	UNIQUE (currency, date),
	CONSTRAINT fk_currency FOREIGN KEY (currency) REFERENCES exchange_rate(currency)
);

CREATE TABLE IF NOT EXISTS account (
	id uuid NOT NULL DEFAULT uuid_generate_v4(),
	name VARCHAR NOT NULL,
	owner_name VARCHAR NOT NULL,
	currency VARCHAR NOT NULL,
	balance NUMERIC NOT NULL,
	PRIMARY KEY (id),
	UNIQUE (name, owner_name),
	CONSTRAINT fk_owner_name FOREIGN KEY (owner_name) REFERENCES users(name),
	CONSTRAINT fk_currency FOREIGN KEY (currency) REFERENCES exchange_rate(currency)
);

CREATE TABLE IF NOT EXISTS account_record (
	id uuid NOT NULL DEFAULT uuid_generate_v4(),
	trans_date TIMESTAMP NOT NULL,
	trans_amount NUMERIC NOT NULL,
	rate NUMERIC NOT NULL DEFAULT 1, -- 換匯當時的匯率
	trans_from uuid NOT NULL,
	trans_to uuid NOT NULL,
	description VARCHAR,
	PRIMARY KEY (id),
	CONSTRAINT fk_trans_from FOREIGN KEY (trans_from) REFERENCES account(id),
	CONSTRAINT fk_trans_to FOREIGN KEY (trans_to) REFERENCES account(id)
);

CREATE TABLE IF NOT EXISTS stock (
	id uuid NOT NULL DEFAULT uuid_generate_v4(),
	code VARCHAR NOT NULL UNIQUE,
	name VARCHAR NOT NULL,
	isin_code VARCHAR NOT NULL UNIQUE, --國際證券辨識號碼
	currency VARCHAR NOT NULL,
	offering_date TIMESTAMP NOT NULL, --上市日
	market_type VARCHAR NOT NULL, --市場別
	industry_type VARCHAR, --產業別
	cfi_code VARCHAR,
	symbol VARCHAR, --yahoo finance symbol
	description VARCHAR,
	PRIMARY KEY (id),
	CONSTRAINT fk_currency FOREIGN KEY (currency) REFERENCES exchange_rate(currency)
);

CREATE TABLE IF NOT EXISTS stock_record (
	id uuid NOT NULL DEFAULT uuid_generate_v4(),
	code VARCHAR NOT NULL,
	deal_date TIMESTAMP NOT NULL,
	deal_share NUMERIC NOT NULL, --成交股數
	open_price NUMERIC NOT NULL, --開盤價
	high_price NUMERIC NOT NULL, --最高價
	low_price NUMERIC NOT NULL, --最低價
	close_price NUMERIC NOT NULL, --收盤價
	PRIMARY KEY (id),
	UNIQUE (code, deal_date),
	CONSTRAINT fk_code FOREIGN KEY (code) REFERENCES stock(code)
);

CREATE TABLE IF NOT EXISTS user_tracking_stock (
	id uuid NOT NULL DEFAULT uuid_generate_v4(),
	user_name VARCHAR NOT NULL,
	stock_code VARCHAR NOT NULL,
	PRIMARY KEY (id),
	UNIQUE (user_name, stock_code),
	CONSTRAINT fk_user_name FOREIGN KEY (user_name) REFERENCES users(name),
	CONSTRAINT fk_stock_code FOREIGN KEY (stock_code) REFERENCES stock(code)
);

CREATE TABLE IF NOT EXISTS user_stock (
	id uuid NOT NULL DEFAULT uuid_generate_v4(),
	user_name VARCHAR NOT NULL,
	stock_code VARCHAR NOT NULL,
	amount NUMERIC NOT NULL DEFAULT 0, --持有股數
	PRIMARY KEY (id),
	UNIQUE (user_name, stock_code),
	CONSTRAINT fk_user_name FOREIGN KEY (user_name) REFERENCES users(name),
	CONSTRAINT fk_stock_code FOREIGN KEY (stock_code) REFERENCES stock(code)
);

CREATE TABLE IF NOT EXISTS user_stock_record (
	id uuid NOT NULL DEFAULT uuid_generate_v4(),
	user_stock_id uuid NOT NULL,
	account_id uuid NOT NULL,
	type VARCHAR NOT NULL, --買 or 賣
	date TIMESTAMP NOT NULL,
	share NUMERIC NOT NULL, --股數
	price NUMERIC NOT NULL, --交易價格
	fee NUMERIC NOT NULL, --手續費
	tax NUMERIC NOT NULL DEFAULT 0, --稅
	PRIMARY KEY (id),
	CONSTRAINT fk_user_stock_id FOREIGN KEY (user_stock_id) REFERENCES user_stock(id),
	CONSTRAINT fk_user_account_id FOREIGN KEY (account_id) REFERENCES account(id)
);

CREATE TABLE IF NOT EXISTS fund (
	id uuid NOT NULL DEFAULT uuid_generate_v4(),
	code VARCHAR NOT NULL UNIQUE, -- 基富通基金 id
	symbol VARCHAR, --yahoo finance symbol
	name VARCHAR NOT NULL,
	isin_code VARCHAR NOT NULL UNIQUE, --國際證券辨識號碼
	offering_date TIMESTAMP NOT NULL, --上市日
	currency VARCHAR NOT NULL,
	description VARCHAR,
	PRIMARY KEY (id),
	CONSTRAINT fk_currency FOREIGN KEY (currency) REFERENCES exchange_rate(currency)
);

CREATE TABLE IF NOT EXISTS fund_record (
	id uuid NOT NULL DEFAULT uuid_generate_v4(),
	code VARCHAR NOT NULL,
	date TIMESTAMP NOT NULL,
	price NUMERIC NOT NULL, 
	PRIMARY KEY (id),
	UNIQUE (code, date),
	CONSTRAINT fk_code FOREIGN KEY (code) REFERENCES fund(code)
);

CREATE TABLE IF NOT EXISTS user_tracking_fund (
	id uuid NOT NULL DEFAULT uuid_generate_v4(),
	user_name VARCHAR NOT NULL,
	fund_code VARCHAR NOT NULL,
	PRIMARY KEY (id),
	UNIQUE (user_name, fund_code),
	CONSTRAINT fk_user_name FOREIGN KEY (user_name) REFERENCES users(name),
	CONSTRAINT fk_fund_code FOREIGN KEY (fund_code) REFERENCES fund(code)
);
