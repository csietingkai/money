CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

CREATE TABLE IF NOT EXISTS options (
	id uuid NOT NULL DEFAULT uuid_generate_v4(),
	catergory VARCHAR NOT NULL,
	name VARCHAR NOT NULL,
	en_text VARCHAR NOT NULL,
	tw_text VARCHAR NOT NULL,
	PRIMARY KEY (id),
	UNIQUE (catergory, name)
);

CREATE TABLE IF NOT EXISTS bank_info (
	id uuid NOT NULL DEFAULT uuid_generate_v4(),
	code VARCHAR(3) NOT NULL UNIQUE,
	name VARCHAR NOT NULL,
	PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS account (
	id uuid NOT NULL DEFAULT uuid_generate_v4(),
	name VARCHAR NOT NULL,
	user_id uuid NOT NULL,
	currency VARCHAR NOT NULL,
	balance NUMERIC NOT NULL,
	bank_code VARCHAR(3),
	bank_no VARCHAR(16),
	shown BOOLEAN DEFAULT true NULL,
	PRIMARY KEY (id),
	UNIQUE (name, user_id),
	CONSTRAINT fk_currency FOREIGN KEY (currency) REFERENCES exchange_rate(currency),
	CONSTRAINT fk_bank_code FOREIGN KEY (bank_code) REFERENCES public.bank_info(code)
);

CREATE TABLE IF NOT EXISTS account_record (
	id uuid NOT NULL DEFAULT uuid_generate_v4(),
	trans_date TIMESTAMP NOT NULL,
	trans_amount NUMERIC NOT NULL,
	trans_from uuid NOT NULL,
	trans_to uuid NOT NULL,
	record_type VARCHAR NOT NULL,
	description VARCHAR,
	file_id uuid,
	PRIMARY KEY (id),
	CONSTRAINT fk_trans_from FOREIGN KEY (trans_from) REFERENCES account(id),
	CONSTRAINT fk_trans_to FOREIGN KEY (trans_to) REFERENCES account(id)
);

CREATE TABLE IF NOT EXISTS user_setting (
	id uuid NOT NULL DEFAULT uuid_generate_v4(),
	user_id uuid NOT NULL,
	stock_type VARCHAR NOT NULL,
	predict_days NUMERIC(3, 0) NOT NULL,
	stock_fee_rate NUMERIC(7, 6) NOT NULL,
	fund_fee_rate NUMERIC(7, 6) NOT NULL,
	account_record_type VARCHAR NOT NULL,
	account_record_deletable BOOLEAN NOT NULL DEFAULT false,
	only_show_own_stock BOOLEAN NOT NULL DEFAULT true,
	only_show_own_fund BOOLEAN NOT NULL DEFAULT true,
	PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS financial_file (
	id uuid NOT NULL DEFAULT uuid_generate_v4(),
	user_id uuid NOT NULL,
	filename VARCHAR NOT NULL,
	type VARCHAR NOT NULL,
	date TIMESTAMP NOT NULL,
	PRIMARY KEY (id)
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
	user_id uuid NOT NULL,
	stock_code VARCHAR NOT NULL,
	PRIMARY KEY (id),
	UNIQUE (user_id, stock_code),
	CONSTRAINT fk_stock_code FOREIGN KEY (stock_code) REFERENCES stock(code)
);

CREATE TABLE IF NOT EXISTS user_stock (
	id uuid NOT NULL DEFAULT uuid_generate_v4(),
	user_id uuid NOT NULL,
	stock_code VARCHAR NOT NULL,
	amount NUMERIC NOT NULL DEFAULT 0, --持有股數
	PRIMARY KEY (id),
	UNIQUE (user_id, stock_code),
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
	total NUMERIC NOT NULL, -- 總額 可能與試算不同
	account_record_id uuid,
	PRIMARY KEY (id),
	CONSTRAINT fk_user_stock_id FOREIGN KEY (user_stock_id) REFERENCES user_stock(id),
	CONSTRAINT fk_user_account_id FOREIGN KEY (account_id) REFERENCES account(id),
	CONSTRAINT fk_user_account_record_id FOREIGN KEY (account_record_id) REFERENCES account_record(id)
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
	user_id uuid NOT NULL,
	fund_code VARCHAR NOT NULL,
	PRIMARY KEY (id),
	UNIQUE (user_id, fund_code),
	CONSTRAINT fk_fund_code FOREIGN KEY (fund_code) REFERENCES fund(code)
);

CREATE TABLE IF NOT EXISTS user_fund (
	id uuid NOT NULL DEFAULT uuid_generate_v4(),
	user_id uuid NOT NULL,
	fund_code VARCHAR NOT NULL,
	amount NUMERIC NOT NULL DEFAULT 0, --持有股數
	PRIMARY KEY (id),
	UNIQUE (user_id, fund_code),
	CONSTRAINT fk_fund_code FOREIGN KEY (fund_code) REFERENCES fund(code)
);

CREATE TABLE IF NOT EXISTS user_fund_record (
	id uuid NOT NULL DEFAULT uuid_generate_v4(),
	user_fund_id uuid NOT NULL,
	account_id uuid NOT NULL,
	type VARCHAR NOT NULL, --買 or 賣
	date TIMESTAMP NOT NULL,
	share NUMERIC NOT NULL, --股數
	price NUMERIC NOT NULL, --交易價格
	rate numeric NOT NULL DEFAULT 1, --匯率
	fee NUMERIC NOT NULL, --手續費
	total NUMERIC NOT NULL, -- 總額
	account_record_id uuid,
	PRIMARY KEY (id),
	CONSTRAINT fk_user_fund_id FOREIGN KEY (user_fund_id) REFERENCES user_fund(id),
	CONSTRAINT fk_user_account_id FOREIGN KEY (account_id) REFERENCES account(id),
	CONSTRAINT fk_user_account_record_id FOREIGN KEY (account_record_id) REFERENCES account_record(id)
);

insert into options (catergory, name, en_text, tw_text) values
	('FILE_TYPE', 'STOCK', 'Stock', '股票'),
	('FILE_TYPE', 'FUND', 'Fund', '基金'),
	('FILE_TYPE', 'CREDIT_CARD', 'Credit Card', '信用卡'),
	('FILE_TYPE', 'PASSBOOK', 'Passbook', '存摺'),
	('FILE_TYPE', 'SALARY_SLIP', 'Salary Slip', '薪資條'),
	('FILE_TYPE', 'OTHER', 'Other', '其他');

insert into options (catergory, name, en_text, tw_text) values
	('STOCK_TYPE', 'TW', 'TW', 'TW'),
	('STOCK_TYPE', 'US', 'US', 'US');

insert into options (catergory, name, en_text, tw_text) values
	('RECORD_TYPE', 'SALARY', 'Salary', '薪資'),
	('RECORD_TYPE', 'BONUS', 'Bonus', '獎金'),
	('RECORD_TYPE', 'FOOD', 'Food', '食物'),
	('RECORD_TYPE', 'LIFE', 'Life', '生活費'),
	('RECORD_TYPE', 'SPORT', 'Sport', '運動'),
	('RECORD_TYPE', 'INVEST', 'Investment', '投資'),
	('RECORD_TYPE', 'TRANSPORTATION', 'Transportation', '交通'),
	('RECORD_TYPE', 'CREDIT_CARD', 'Credit Card', '信用卡費'),
	('RECORD_TYPE', 'MEDIC', 'Medic', '醫療'),
	('RECORD_TYPE', 'FEE', 'Fee', '手續費'),
	('RECORD_TYPE', 'DONATE', 'Donate', '抖內'),
	('RECORD_TYPE', 'OTHER', 'Other', '其他');

insert into bank_info (code, name) values
	('004', '臺灣銀行'),
	('005', '土地銀行'),
	('006', '合作金庫'),
	('007', '第一銀行'),
	('008', '華南銀行'),
	('009', '彰化銀行'),
	('011', '上海銀行'),
	('012', '富邦銀行'),
	('013', '國泰世華'),
	('016', '高雄銀行'),
	('017', '兆豐商銀'),
	('021', '花旗銀行'),
	('048', '王道銀行'),
	('050', '台灣企銀'),
	('052', '渣打銀行'),
	('053', '台中銀行'),
	('054', '京城銀行'),
	('081', '滙豐銀行'),
	('101', '瑞興銀行'),
	('102', '華泰銀行'),
	('103', '新光銀行'),
	('108', '陽信銀行'),
	('118', '板信商銀'),
	('147', '三信銀行'),
	('700', '中華郵政'),
	('803', '聯邦銀行'),
	('805', '遠東商銀'),
	('806', '元大銀行'),
	('807', '永豐銀行'),
	('808', '玉山銀行'),
	('809', '凱基銀行'),
	('810', '星展銀行'),
	('812', '台新銀行'),
	('815', '日盛銀行'),
	('816', '安泰銀行'),
	('822', '中國信託'),
	('823', '將來銀行'),
	('824', 'LINE Bank'),
	('826', '樂天銀行');