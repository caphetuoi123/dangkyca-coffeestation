--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: admin_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    setting_key text NOT NULL,
    setting_value text NOT NULL,
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: employees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employees (
    id text NOT NULL,
    name text NOT NULL,
    phone text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: stores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stores (
    id text NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    color text DEFAULT '#3b82f6'::text
);


--
-- Name: weekly_schedules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.weekly_schedules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    week_key text NOT NULL,
    employee_id text NOT NULL,
    preferences jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: admin_settings admin_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_settings
    ADD CONSTRAINT admin_settings_pkey PRIMARY KEY (id);


--
-- Name: admin_settings admin_settings_setting_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_settings
    ADD CONSTRAINT admin_settings_setting_key_key UNIQUE (setting_key);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: stores stores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stores
    ADD CONSTRAINT stores_pkey PRIMARY KEY (id);


--
-- Name: weekly_schedules weekly_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weekly_schedules
    ADD CONSTRAINT weekly_schedules_pkey PRIMARY KEY (id);


--
-- Name: weekly_schedules weekly_schedules_week_key_employee_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weekly_schedules
    ADD CONSTRAINT weekly_schedules_week_key_employee_id_key UNIQUE (week_key, employee_id);


--
-- Name: admin_settings update_admin_settings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_admin_settings_updated_at BEFORE UPDATE ON public.admin_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: weekly_schedules update_weekly_schedules_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_weekly_schedules_updated_at BEFORE UPDATE ON public.weekly_schedules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: weekly_schedules weekly_schedules_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weekly_schedules
    ADD CONSTRAINT weekly_schedules_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: employees Allow public delete access to employees; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public delete access to employees" ON public.employees FOR DELETE USING (true);


--
-- Name: stores Allow public delete access to stores; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public delete access to stores" ON public.stores FOR DELETE USING (true);


--
-- Name: weekly_schedules Allow public delete access to weekly_schedules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public delete access to weekly_schedules" ON public.weekly_schedules FOR DELETE USING (true);


--
-- Name: admin_settings Allow public insert access to admin_settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public insert access to admin_settings" ON public.admin_settings FOR INSERT WITH CHECK (true);


--
-- Name: employees Allow public insert access to employees; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public insert access to employees" ON public.employees FOR INSERT WITH CHECK (true);


--
-- Name: stores Allow public insert access to stores; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public insert access to stores" ON public.stores FOR INSERT WITH CHECK (true);


--
-- Name: weekly_schedules Allow public insert access to weekly_schedules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public insert access to weekly_schedules" ON public.weekly_schedules FOR INSERT WITH CHECK (true);


--
-- Name: admin_settings Allow public read access to admin_settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access to admin_settings" ON public.admin_settings FOR SELECT USING (true);


--
-- Name: employees Allow public read access to employees; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access to employees" ON public.employees FOR SELECT USING (true);


--
-- Name: stores Allow public read access to stores; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access to stores" ON public.stores FOR SELECT USING (true);


--
-- Name: weekly_schedules Allow public read access to weekly_schedules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access to weekly_schedules" ON public.weekly_schedules FOR SELECT USING (true);


--
-- Name: admin_settings Allow public update access to admin_settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public update access to admin_settings" ON public.admin_settings FOR UPDATE USING (true);


--
-- Name: employees Allow public update access to employees; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public update access to employees" ON public.employees FOR UPDATE USING (true);


--
-- Name: stores Allow public update access to stores; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public update access to stores" ON public.stores FOR UPDATE USING (true);


--
-- Name: weekly_schedules Allow public update access to weekly_schedules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public update access to weekly_schedules" ON public.weekly_schedules FOR UPDATE USING (true);


--
-- Name: admin_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: employees; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

--
-- Name: stores; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

--
-- Name: weekly_schedules; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.weekly_schedules ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


