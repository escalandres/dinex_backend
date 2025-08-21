CREATE TABLE usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    nombre TEXT,
    apellido TEXT,
    oauth_provider TEXT DEFAULT '',
    oauth_user_id TEXT DEFAULT '',
    email_verified INTEGER DEFAULT 0,
    profile_picture TEXT DEFAULT '',
    created_date NUMERIC NOT NULL,
    last_login NUMERIC,
    hashed_password TEXT DEFAULT ''
);

UPDATE sqlite_sequence SET seq = 99999 WHERE name = 'usuarios';

CREATE TABLE instrumentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER,
    descripcion TEXT,
    tipo TEXT,
    subtipo TEXT,
    dia_corte INTEGER,
    dia_limite_pago INTEGER,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE otp_cambio_password (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INT NOT NULL,
    codigo_otp VARCHAR(10) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP NOT NULL,
    usado BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);