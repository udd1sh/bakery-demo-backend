-- Run this once in Supabase's SQL Editor (Table Editor > SQL Editor)
-- to create the orders table.

create table orders (
  id bigint generated always as identity primary key,
  customer_name text,
  phone text,
  message text,
  item text,
  qty int default 1,
  source text default 'WhatsApp',
  status text default 'pending',
  created_at timestamp with time zone default now()
);
