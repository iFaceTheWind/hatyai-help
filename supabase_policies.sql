-- Drop existing policies to recreate them
drop policy if exists "Anyone can insert requests" on public.requests;
drop policy if exists "Anyone can update requests" on public.requests;

-- Create new restricted policies

-- Allow only authenticated users to insert requests
create policy "Authenticated users can insert requests"
  on public.requests for insert
  with check ( auth.role() = 'authenticated' );

-- Allow only authenticated users to update requests
create policy "Authenticated users can update requests"
  on public.requests for update
  using ( auth.role() = 'authenticated' );

-- READ policy remains public (from previous script)
-- If not, run: create policy "Anyone can read requests" on public.requests for select using ( true );

