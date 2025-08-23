CREATE TABLE IF NOT EXISTS "cat_tipo_instrumentos" (
	"id" INTEGER NOT NULL UNIQUE,
	"nombre" TEXT NOT NULL,
	PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "cat_subtipo_instrumentos" (
	"id" INTEGER NOT NULL UNIQUE,
	"id_tipo_instrumento" INTEGER NOT NULL,
	"nombre" TEXT NOT NULL,
	PRIMARY KEY("id"),
	FOREIGN KEY ("id_tipo_instrumento") REFERENCES "cat_tipo_instrumentos"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS "cat_categoria_gastos" (
	"id" INTEGER NOT NULL UNIQUE,
	"nombre" TEXT,
	"tipo" TEXT,
	"descripcion" TEXT,
	PRIMARY KEY("id")
); 

CREATE TABLE IF NOT EXISTS "cat_tipo_gastos" (
	"id" INTEGER NOT NULL UNIQUE,
	"descripcion" INTEGER,
	PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "cat_tipo_inversiones" (
	"id" INTEGER NOT NULL UNIQUE,
	"nombre" TEXT NOT NULL,
	"categoria" TEXT NOT NULL,
	"liquidez" TEXT NOT NULL,
	"fiscal" BOOLEAN NOT NULL DEFAULT true,
	"descripcion" TEXT NOT NULL,
	PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "cat_frecuencia" (
	"id" INTEGER NOT NULL UNIQUE,
	"descripcion" TEXT,
	"frecuencia_dias" INTEGER,
	PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "cat_fuente_ingresos" (
	"id" INTEGER NOT NULL UNIQUE,
	"fuente" TEXT,
	"tipo" TEXT,
	"descripcion" TEXT,
	PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "paises" (
	"id" INTEGER NOT NULL UNIQUE,
	"nombre" TEXT,
	"codigo_iso" TEXT,
	"moneda_local" TEXT,
	"simbolo_moneda" TEXT,
	"formato_moneda" TEXT,
	"emoji_bandera" TEXT,
	PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "usuarios" (
	"id" INTEGER NOT NULL UNIQUE,
	"email" TEXT NOT NULL UNIQUE,
	"nombre" TEXT NOT NULL,
	"apellido" TEXT NOT NULL,
	"hashed_password" TEXT NOT NULL DEFAULT '''''',
	"profile_picture" TEXT NOT NULL DEFAULT '''''',
	"pais" INTEGER NOT NULL,
	"oauth_provider" TEXT NOT NULL DEFAULT '''''',
	"oauth_user_id" TEXT NOT NULL DEFAULT '''''',
	"email_verified" BOOLEAN NOT NULL,
	"created_date" TEXT NOT NULL,
	"last_login" TEXT NOT NULL,
	PRIMARY KEY("id"),
	FOREIGN KEY ("pais") REFERENCES "paises"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE INDEX IF NOT EXISTS "usuarios_index_0"
ON "usuarios" ("email");

UPDATE sqlite_sequence SET seq = 99999 WHERE name = 'usuarios';

CREATE TABLE IF NOT EXISTS "codigos_otp" (
	"id" INTEGER NOT NULL UNIQUE,
	"usuario_id" INTEGER NOT NULL,
	"codigo_opt" TEXT NOT NULL,
	"fecha_creacion" TEXT NOT NULL DEFAULT '(CURRENT_TIMESTAMP)',
	"fecha_expiracion" TEXT NOT NULL,
	"usado" BOOLEAN NOT NULL DEFAULT false,
	PRIMARY KEY("id"),
	FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS "instrumentos" (
	"id" INTEGER NOT NULL UNIQUE,
	"usuario_id" INTEGER NOT NULL,
	"descripcion" TEXT NOT NULL,
	"tipo" INTEGER NOT NULL,
	"subtipo" INTEGER NOT NULL,
	"dia_corte" INTEGER NOT NULL,
	"dia_limite_pago" INTEGER NOT NULL,
	PRIMARY KEY("id"),
	FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS "gastos" (
	"id" INTEGER NOT NULL UNIQUE,
	"usuario_id" INTEGER,
	"concepto" TEXT NOT NULL,
	"id_instrumento" INTEGER NOT NULL,
	"frecuencia" INTEGER NOT NULL,
	"tipo_gasto" INTEGER,
	"monto" NUMERIC NOT NULL,
	"plazo" INTEGER DEFAULT 0,
	"fecha_aplicacion" TEXT,
	"fecha_registro" TEXT,
	"comentario" TEXT DEFAULT '''''',
	"categoria" INTEGER,
	PRIMARY KEY("id"),
	FOREIGN KEY ("frecuencia") REFERENCES "cat_frecuencia"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY ("categoria") REFERENCES "cat_categoria_gastos"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY ("id_instrumento") REFERENCES "instrumentos"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS "ahorros" (
	"id" INTEGER NOT NULL UNIQUE,
	"usuario_id" INTEGER NOT NULL,
	"concepto" TEXT NOT NULL,
	"id_instrumento" INTEGER NOT NULL,
	"esta_congelado" BOOLEAN DEFAULT false,
	"plazo_dias" INTEGER NOT NULL,
	"monto" NUMERIC NOT NULL,
	"fecha_aplicacion" TEXT NOT NULL,
	"fecha_registro" TEXT NOT NULL,
	"tasa" NUMERIC NOT NULL,
	"comentario" TEXT DEFAULT '''''',
	"composicion_year" INTEGER DEFAULT 360,
	PRIMARY KEY("id"),
	FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY ("id_instrumento") REFERENCES "instrumentos"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS "ingresos" (
	"id" INTEGER NOT NULL UNIQUE,
	"usuario_id" INTEGER NOT NULL,
	"es_fijo" BOOLEAN NOT NULL DEFAULT true,
	"fuente" INTEGER NOT NULL,
	"descripcion" TEXT,
	"monto" NUMERIC NOT NULL,
	"fecha_registro" TEXT,
	"fecha_aplicacion" TEXT,
	PRIMARY KEY("id"),
	FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY ("fuente") REFERENCES "cat_fuente_ingresos"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS "inversiones" (
	"id" INTEGER NOT NULL UNIQUE,
	"usuario_id" INTEGER,
	"id_instrumento" INTEGER,
	"tipo_inversion" INTEGER,
	"monto_operacion" NUMERIC,
	"moneda_operacion" TEXT,
	"monto_local" NUMERIC,
	"tipo_cambio_operacion" NUMERIC,
	"fecha_inversion" TEXT,
	"fecha_registro" TEXT,
	PRIMARY KEY("id"),
	FOREIGN KEY ("tipo_inversion") REFERENCES "cat_tipo_inversiones"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY ("id_instrumento") REFERENCES "instrumentos"("id")
	ON UPDATE NO ACTION ON DELETE NO ACTION
);


