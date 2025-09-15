CREATE TABLE IF NOT EXISTS "instruments_types_catalog" (
	"id" INTEGER NOT NULL UNIQUE,
	"name" TEXT NOT NULL,
	"color" TEXT,
	PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "instruments_subtypes_catalog" (
	"id" INTEGER NOT NULL UNIQUE,
	"id_instrument_type" INTEGER NOT NULL,
	"name" TEXT NOT NULL,
	"color" TEXT,
	PRIMARY KEY("id"),
	FOREIGN KEY ("id_instrument_type") REFERENCES "instruments_types_catalog"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS "expenses_categories_catalog" (
	"id" INTEGER NOT NULL UNIQUE,
	"name" TEXT,
	"type" TEXT,
	"description" TEXT,
	PRIMARY KEY("id")
); 

CREATE TABLE IF NOT EXISTS "expenses_types_catalog" (
	"id" INTEGER NOT NULL UNIQUE,
	"description" INTEGER,
	PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "investments_types_catalog" (
	"id" INTEGER NOT NULL UNIQUE,
	"name" TEXT NOT NULL,
	"category" TEXT NOT NULL,
	"liquidity" TEXT NOT NULL,
	"is_fiscal" BOOLEAN NOT NULL DEFAULT true,
	"description" TEXT NOT NULL,
	PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "frequency_catalog" (
	"id" INTEGER NOT NULL UNIQUE,
	"description" TEXT,
	"frequency_days" INTEGER,
	PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "income_sources_catalog" (
	"id" INTEGER NOT NULL UNIQUE,
	"source" TEXT,
	"type" TEXT,
	"description" TEXT,
	PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "countries" (
	"id" INTEGER NOT NULL UNIQUE,
	"name" TEXT,
	"country_iso_code" TEXT,
	"currency" TEXT,
	"currency_symbol" TEXT,
	"currency_code" TEXT,
	"currency_format" TEXT,
	"flag_icon" TEXT,
	"language_code" TEXT,
	PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "users" (
	"id" INTEGER PRIMARY KEY AUTOINCREMENT,
	"uuid" TEXT UNIQUE NOT NULL DEFAULT (lower(hex(randomblob(16)))),
	"email" TEXT NOT NULL UNIQUE,
	"name" TEXT NOT NULL,
	"lastname" TEXT NOT NULL,
	"hashed_password" TEXT NOT NULL DEFAULT '''''',
	"profile_picture" TEXT NOT NULL DEFAULT '''''',
	"country" INTEGER NOT NULL,
	"oauth_provider" TEXT NOT NULL DEFAULT '''''',
	"oauth_user_id" TEXT NOT NULL DEFAULT '''''',
	"email_verified" BOOLEAN NOT NULL,
	"created_date" TEXT NOT NULL,
	"last_login" TEXT NOT NULL,
	FOREIGN KEY ("country") REFERENCES "countries"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE INDEX IF NOT EXISTS "users_index_0"
ON "users" ("email");

UPDATE sqlite_sequence SET seq = 99999 WHERE name = 'users';

CREATE TABLE IF NOT EXISTS "otp_codes" (
	"id" INTEGER NOT NULL UNIQUE,
	"user_id" INTEGER NOT NULL,
	"otp_code" TEXT NOT NULL,
	"creation_date" TEXT NOT NULL DEFAULT '(CURRENT_TIMESTAMP)',
	"expiration_date" TEXT NOT NULL,
	"is_used" BOOLEAN NOT NULL DEFAULT false,
	PRIMARY KEY("id"),
	FOREIGN KEY ("user_id") REFERENCES "users"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS "instruments" (
	"id" INTEGER NOT NULL UNIQUE,
	"user_id" INTEGER NOT NULL,
	"description" TEXT NOT NULL,
	"type" INTEGER NOT NULL,
	"subtype" INTEGER NOT NULL,
	"cut_off_day" INTEGER NOT NULL,
	"payment_due_day" INTEGER NOT NULL,
	"currency" TEXT NOT NULL,
	PRIMARY KEY("id"),
	FOREIGN KEY ("user_id") REFERENCES "users"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS "expenses" (
	"id" INTEGER NOT NULL UNIQUE,
	"user_id" INTEGER,
	"concept" TEXT NOT NULL,
	"id_instrument" INTEGER NOT NULL,
	"frequency" INTEGER NOT NULL,
	"expense_type" INTEGER,
	"amount" NUMERIC NOT NULL,
	"currency" TEXT NOT NULL,
	"term" INTEGER DEFAULT 0,
	"application_date" TEXT,
	"registration_date" TEXT,
	"comment" TEXT DEFAULT '''''',
	"category" INTEGER,
	PRIMARY KEY("id"),
	FOREIGN KEY ("frequency") REFERENCES "frequency_catalog"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY ("category") REFERENCES "expenses_categories_catalog"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY ("user_id") REFERENCES "users"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY ("id_instrument") REFERENCES "instruments"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS "savings" (
	"id" INTEGER NOT NULL UNIQUE,
	"user_id" INTEGER NOT NULL,
	"concept" TEXT NOT NULL,
	"id_instrument" INTEGER NOT NULL,
	"is_frozen" BOOLEAN DEFAULT false,
	"term_days" INTEGER NOT NULL,
	"amount" NUMERIC NOT NULL,
	"currency" TEXT NOT NULL,
	"application_date" TEXT NOT NULL,
	"registration_date" TEXT NOT NULL,
	"rate" NUMERIC NOT NULL,
	"comment" TEXT DEFAULT '''''',
	"year_composition" INTEGER DEFAULT 360,
	PRIMARY KEY("id"),
	FOREIGN KEY ("user_id") REFERENCES "users"("id")
		ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY ("id_instrument") REFERENCES "instruments"("id")
		ON UPDATE NO ACTION ON DELETE NO ACTION
);


CREATE TABLE IF NOT EXISTS "incomes" (
	"id" INTEGER NOT NULL UNIQUE,
	"user_id" INTEGER NOT NULL,
	"is_fixed" BOOLEAN NOT NULL DEFAULT true,
	"source" INTEGER NOT NULL,
	"description" TEXT,
	"amount" NUMERIC NOT NULL,
	"currency" TEXT NOT NULL,
	"frequency" INTEGER NOT NULL,
	"registration_date" TEXT,
	"application_date" TEXT,
	PRIMARY KEY("id"),
	FOREIGN KEY ("user_id") REFERENCES "users"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY ("frequency") REFERENCES "frequency_catalog"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY ("source") REFERENCES "income_sources_catalog"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS "investments" (
	"id" INTEGER NOT NULL UNIQUE,
	"user_id" INTEGER,
	"id_instrument" INTEGER, -- puede vincular a instrumentos bursátiles, bonos, etc.
	"investment_type" INTEGER,
	"operation_amount" NUMERIC,
	"operation_currency" TEXT,
	"local_currency_amount" NUMERIC,
	"exchange_rate" NUMERIC,
	"investment_date" TEXT,
	"registration_date" TEXT,
	PRIMARY KEY("id"),
	FOREIGN KEY ("investment_type") REFERENCES "investments_types_catalog"("id")
		ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY ("user_id") REFERENCES "users"("id")
		ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY ("id_instrument") REFERENCES "instruments"("id")
		ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS "stocks_catalog" (
	"id" INTEGER PRIMARY KEY,
	"ticker_symbol" TEXT NOT NULL UNIQUE,       -- Ej: AAPL, TSLA, VOO
	"company_name" TEXT NOT NULL,               -- Ej: Apple Inc.
	"logo_url" TEXT,                            -- URL al ícono/logo
	"market" TEXT,                              -- Ej: NASDAQ, NYSE, BMV
	"sector" TEXT,                              -- Ej: Tecnología, Consumo, Finanzas
	"industry" TEXT,                            -- Ej: Semiconductores, Retail, Bancos
	"isin" TEXT,                                -- Código internacional
	"country" TEXT,                             -- País de cotización
	"currency" TEXT                             -- USD, MXN, EUR, etc.
);

CREATE TABLE IF NOT EXISTS "equity_positions" (
	"id" INTEGER PRIMARY KEY,
	"investment_id" INTEGER NOT NULL,
	"stock_id" INTEGER NOT NULL,
	"quantity" NUMERIC NOT NULL, -- Número de acciones o unidades títulos
	"operation_amount" NUMERIC,
	FOREIGN KEY ("investment_id") REFERENCES "investments"("id")
		ON UPDATE CASCADE ON DELETE CASCADE,
	FOREIGN KEY ("stock_id") REFERENCES "stocks_catalog"("id")
		ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS "csrf_tokens" (
	"csrf_token" TEXT PRIMARY KEY,
	"user_id" INTEGER NOT NULL,
	"jti" TEXT NOT NULL,
	"created_at" NUMERIC DEFAULT CURRENT_TIMESTAMP,
	"expires_at" NUMERIC,
	"revoked" BOOLEAN DEFAULT 0,
	FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);