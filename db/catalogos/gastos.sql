INSERT INTO cat_categoria_gastos (nombre, tipo, descripcion) VALUES
('Casa', 'Fijo', 'Renta, mantenimiento, hipoteca'),
('Servicios', 'Fijo', 'Luz, agua, gas, internet'),
('Streaming', 'Fijo', 'Netflix, Spotify, Disney+, etc.'),
('Personal', 'Variable', 'Ropa, cuidado personal, salud'),
('Ocio', 'Variable', 'Salidas, cine, restaurantes'),
('Transporte', 'Variable', 'Gasolina, Uber, transporte público'),
('Educación', 'Variable', 'Cursos, libros, capacitaciones'),
('Tecnología', 'Variable', 'Gadgets, software, reparaciones'),
('Imprevistos', 'Variable', 'Emergencias, gastos no planeados'),
('Finanzas', 'Fijo', 'Seguros, comisiones bancarias, ahorro'),
('Familia', 'Variable', 'Préstamo a familiares u amigos'),
('Otro', 'Variable', '');

INSERT INTO cat_tipo_gastos (descripcion) VALUES
('Único'),
('Fijo'),
('A meses');

INSERT INTO cat_frecuencia (descripcion, frecuencia_dias) VALUES
('Diario', 1),
('Semanal', 7),
('Quincenal', 15),
('Mensual', 30),
('Bimestral', 60),
('Trimestral', 90),
('Semestral', 180),
('Anual', 360);