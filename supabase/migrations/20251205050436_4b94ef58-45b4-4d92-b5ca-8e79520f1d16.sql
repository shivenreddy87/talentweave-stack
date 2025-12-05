-- Add interview scheduling fields to job_applications
ALTER TABLE public.job_applications 
ADD COLUMN IF NOT EXISTS interview_date DATE,
ADD COLUMN IF NOT EXISTS interview_time TIME,
ADD COLUMN IF NOT EXISTS interview_notes TEXT;

-- Update status check to include shortlisted
-- First let's ensure we can use these statuses: pending, shortlisted, accepted, rejected