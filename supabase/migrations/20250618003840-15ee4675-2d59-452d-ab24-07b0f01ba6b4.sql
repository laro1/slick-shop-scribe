
-- Habilitar RLS en las tablas si no está habilitado
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- Crear políticas para la tabla items (permitir todas las operaciones)
CREATE POLICY "Allow all operations on items" ON public.items
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Crear políticas para la tabla sales (permitir todas las operaciones)
CREATE POLICY "Allow all operations on sales" ON public.sales
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Crear una política específica para SELECT en items
DROP POLICY IF EXISTS "Allow all operations on items" ON public.items;
CREATE POLICY "Enable read access for all users on items" ON public.items
  FOR SELECT 
  USING (true);

CREATE POLICY "Enable insert access for all users on items" ON public.items
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Enable update access for all users on items" ON public.items
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for all users on items" ON public.items
  FOR DELETE 
  USING (true);

-- Crear políticas específicas para sales
DROP POLICY IF EXISTS "Allow all operations on sales" ON public.sales;
CREATE POLICY "Enable read access for all users on sales" ON public.sales
  FOR SELECT 
  USING (true);

CREATE POLICY "Enable insert access for all users on sales" ON public.sales
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Enable update access for all users on sales" ON public.sales
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for all users on sales" ON public.sales
  FOR DELETE 
  USING (true);

-- Crear bucket de storage para imágenes si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('article_images', 'article_images', true)
ON CONFLICT (id) DO NOTHING;

-- Crear políticas para el bucket de storage
CREATE POLICY "Enable read access for all users on article_images" ON storage.objects
  FOR SELECT 
  USING (bucket_id = 'article_images');

CREATE POLICY "Enable insert access for all users on article_images" ON storage.objects
  FOR INSERT 
  WITH CHECK (bucket_id = 'article_images');

CREATE POLICY "Enable update access for all users on article_images" ON storage.objects
  FOR UPDATE 
  USING (bucket_id = 'article_images')
  WITH CHECK (bucket_id = 'article_images');

CREATE POLICY "Enable delete access for all users on article_images" ON storage.objects
  FOR DELETE 
  USING (bucket_id = 'article_images');
