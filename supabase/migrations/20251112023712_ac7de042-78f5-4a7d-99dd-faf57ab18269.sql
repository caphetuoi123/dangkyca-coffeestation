-- Enable realtime for tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.employees;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stores;
ALTER PUBLICATION supabase_realtime ADD TABLE public.weekly_schedules;
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_settings;