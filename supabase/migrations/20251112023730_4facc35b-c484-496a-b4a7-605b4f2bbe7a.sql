-- Add salary_coefficient column to employees table
ALTER TABLE public.employees 
ADD COLUMN salary_coefficient DECIMAL(10,2) NOT NULL DEFAULT 1.0;