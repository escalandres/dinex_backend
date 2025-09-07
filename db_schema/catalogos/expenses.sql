INSERT INTO expenses_categories_catalog (name, type, description) VALUES
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

INSERT INTO expenses_types_catalog (description) VALUES
('Único'),
('Fijo'),
('A meses');

INSERT INTO frequency_catalog (description, frequency_days) VALUES
('Diario', 1),
('Semanal', 7),
('Quincenal', 15),
('Mensual', 30),
('Bimestral', 60),
('Trimestral', 90),
('Semestral', 180),
('Anual', 360);