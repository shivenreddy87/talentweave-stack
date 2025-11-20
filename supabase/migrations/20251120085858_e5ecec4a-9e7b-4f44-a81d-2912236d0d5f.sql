-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false);

-- Add columns to job_applications for additional applicant info
ALTER TABLE public.job_applications
ADD COLUMN phone_number text,
ADD COLUMN resume_url text;

-- Create storage policies for resumes
CREATE POLICY "Users can upload their own resumes"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own resumes"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Employers can view resumes for their job applications"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'resumes'
  AND EXISTS (
    SELECT 1
    FROM public.job_applications ja
    JOIN public.jobs j ON ja.job_id = j.id
    WHERE j.employer_id = auth.uid()
    AND ja.resume_url = storage.objects.name
  )
);