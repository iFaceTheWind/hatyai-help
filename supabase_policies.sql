-- Drop existing restrictive policies
drop policy if exists "Authenticated users can insert requests" on public.requests;
drop policy if exists "Authenticated users can update requests" on public.requests;

-- Also drop potential duplicate names to ensure clean slate
drop policy if exists "Anyone can insert requests" on public.requests;
drop policy if exists "Anyone can update requests" on public.requests;

-- Create OPEN policies for anonymous usage

-- 1. Allow ANYONE to insert requests (Public/Anonymous)
create policy "Anyone can insert requests"
  on public.requests for insert
  with check ( true );

-- 2. Allow ANYONE to update requests (e.g. mark as resolved)
create policy "Anyone can update requests"
  on public.requests for update
  using ( true );

-- Note: "Anyone can read requests" policy usually already exists from schema setup
