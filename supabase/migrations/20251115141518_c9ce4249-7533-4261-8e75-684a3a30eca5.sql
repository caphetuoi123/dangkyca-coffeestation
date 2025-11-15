-- Enable realtime for scheduled_weeks table so employees can see when registration is reopened
ALTER PUBLICATION supabase_realtime ADD TABLE public.scheduled_weeks;