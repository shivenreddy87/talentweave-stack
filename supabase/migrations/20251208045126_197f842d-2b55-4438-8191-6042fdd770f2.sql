-- Add RLS policy to allow employers to update applications for their jobs
CREATE POLICY "Employers can update applications for their jobs"
ON public.job_applications
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT employer_id FROM jobs WHERE jobs.id = job_applications.job_id
  )
);