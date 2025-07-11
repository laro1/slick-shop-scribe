-- Agregar columnas para almacenar el stock inicial y precio inicial
ALTER TABLE public.items 
ADD COLUMN initial_stock integer NOT NULL DEFAULT 0,
ADD COLUMN initial_price numeric NOT NULL DEFAULT 0;

-- Actualizar los registros existentes con los valores actuales como iniciales
UPDATE public.items 
SET initial_stock = stock, initial_price = price;