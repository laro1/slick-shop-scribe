
-- Primero, creamos un tipo de dato ENUM para los roles de usuario,
-- esto asegura que solo los roles definidos puedan ser usados.
CREATE TYPE public.user_role AS ENUM (
    'Administrador',
    'Vendedor',
    'Inventarista',
    'Consultor'
);

-- Ahora, creamos la tabla 'users' para almacenar la información
-- de cada negocio/usuario registrado en el sistema.
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    business_name TEXT NOT NULL,
    pin TEXT NOT NULL,
    logo_url TEXT,
    role public.user_role NOT NULL DEFAULT 'Vendedor',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Añadimos un comentario importante sobre la columna 'pin'.
-- Por seguridad, los PINs no deberían guardarse como texto plano.
COMMENT ON COLUMN public.users.pin IS 'For security, PINs should be stored as hashes, not plain text.';
