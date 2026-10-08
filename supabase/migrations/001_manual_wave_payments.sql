create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_email text not null,
  model_id text not null check (model_id ~ '^model([1-9]|1[0-4])$'),
  transaction_id text not null,
  amount_xof integer not null default 2000 check (amount_xof = 2000),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id)
);

create unique index if not exists payments_transaction_id_unique
  on public.payments (lower(btrim(transaction_id)));
create index if not exists payments_status_created_at_idx
  on public.payments (status, created_at desc);

create table if not exists public.entitlements (
  user_id uuid not null references auth.users(id) on delete cascade,
  model_id text not null check (model_id ~ '^model([1-9]|1[0-4])$'),
  payment_id uuid not null unique references public.payments(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (user_id, model_id)
);

alter table public.payments enable row level security;
alter table public.entitlements enable row level security;

drop policy if exists "Users can read their own payments" on public.payments;
create policy "Users can read their own payments"
  on public.payments for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Users can read their own entitlements" on public.entitlements;
create policy "Users can read their own entitlements"
  on public.entitlements for select
  to authenticated
  using (user_id = (select auth.uid()));

revoke all on public.payments from anon, authenticated;
grant select on public.payments to authenticated;
revoke all on public.entitlements from anon, authenticated;
grant select on public.entitlements to authenticated;
grant all on public.payments, public.entitlements to service_role;

create or replace function public.review_manual_payment(
  p_payment_id uuid,
  p_decision text,
  p_reviewed_by uuid
)
returns public.payments
language plpgsql
security definer
set search_path = ''
as $$
declare
  reviewed_payment public.payments;
begin
  if p_decision is null or p_decision not in ('approved', 'rejected') or p_reviewed_by is null then
    raise exception 'Invalid review request';
  end if;

  select * into reviewed_payment
  from public.payments
  where id = p_payment_id
  for update;

  if not found then
    raise exception 'Payment request not found';
  end if;
  if reviewed_payment.status <> 'pending' then
    if reviewed_payment.status = p_decision then
      return reviewed_payment;
    end if;
    raise exception 'Payment request has already been reviewed';
  end if;

  update public.payments
  set status = p_decision,
      reviewed_at = now(),
      reviewed_by = p_reviewed_by
  where id = p_payment_id
  returning * into reviewed_payment;

  if p_decision = 'approved' then
    insert into public.entitlements (user_id, model_id, payment_id)
    values (reviewed_payment.user_id, reviewed_payment.model_id, reviewed_payment.id)
    on conflict (user_id, model_id) do nothing;
  end if;

  return reviewed_payment;
end;
$$;

revoke all on function public.review_manual_payment(uuid, text, uuid) from public, anon, authenticated;
grant execute on function public.review_manual_payment(uuid, text, uuid) to service_role;
