
CREATE TABLE public.admin_config (
    id INT PRIMARY KEY DEFAULT 1,
    pin TEXT NOT NULL,
    CONSTRAINT admin_config_singleton CHECK (id = 1)
);

COMMENT ON TABLE public.admin_config IS 'Admin configuration settings. Only editable from Supabase dashboard.';

INSERT INTO public.admin_config (id, pin) VALUES (1, '2607');

ALTER TABLE public.admin_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to admin config"
ON public.admin_config
FOR SELECT
USING (true);
