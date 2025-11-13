-- Create table to track scheduled weeks
CREATE TABLE IF NOT EXISTS public.scheduled_weeks (
  week_key TEXT PRIMARY KEY,
  is_scheduled BOOLEAN NOT NULL DEFAULT false,
  store_schedules JSONB NOT NULL DEFAULT '{}'::jsonb,
  scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scheduled_weeks ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public read access to scheduled_weeks" 
  ON public.scheduled_weeks 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert access to scheduled_weeks" 
  ON public.scheduled_weeks 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public update access to scheduled_weeks" 
  ON public.scheduled_weeks 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Allow public delete access to scheduled_weeks" 
  ON public.scheduled_weeks 
  FOR DELETE 
  USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_scheduled_weeks_updated_at
  BEFORE UPDATE ON public.scheduled_weeks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();