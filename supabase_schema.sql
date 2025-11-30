-- Create the requests table
create table public.requests (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  type text not null,
  urgency text not null,
  description text,
  status text default 'open'::text,
  lat double precision not null,
  lng double precision not null,
  address text,
  contact_phone text,
  contact_line_id text,
  contact_whatsapp text,
  user_id uuid -- optional link to auth.users
);

-- Enable Row Level Security (RLS)
alter table public.requests enable row level security;

-- Create policies
-- Allow anyone to read requests
create policy "Anyone can read requests"
  on public.requests for select
  using ( true );

-- Allow anyone to insert requests (for MVP, effectively public)
create policy "Anyone can insert requests"
  on public.requests for insert
  with check ( true );

-- Allow anyone to update requests (for MVP to allow volunteers to mark status)
create policy "Anyone can update requests"
  on public.requests for update
  using ( true );

-- Realtime subscription
alter publication supabase_realtime add table public.requests;

