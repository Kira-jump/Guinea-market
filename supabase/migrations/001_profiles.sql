-- Enum statut vendeur
create type vendor_status as enum ('none', 'pending', 'approved', 'suspended');

-- Table profiles liee a auth.users
create table public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  prenom          text,
  nom             text,
  telephone       text,
  avatar_url      text,
  ville           text,
  is_admin        boolean not null default false,
  vendor_status   vendor_status not null default 'none',
  vendor_requested_at  timestamptz,
  vendor_approved_at   timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Index sur le statut vendeur
create index profiles_vendor_status_idx on public.profiles(vendor_status);

-- Helper admin
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

-- Trigger creation auto du profile a inscription
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, prenom, nom, telephone)
  values (
    new.id,
    new.raw_user_meta_data->>'prenom',
    new.raw_user_meta_data->>'nom',
    new.raw_user_meta_data->>'telephone'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Trigger updated_at auto
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Activation RLS
alter table public.profiles enable row level security;

-- SELECT propre profil
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

-- SELECT admin tous profils
create policy "profiles_select_admin"
  on public.profiles for select
  using (public.is_admin());

-- UPDATE propre profil sans toucher is_admin et vendor_status
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and is_admin = (select is_admin from public.profiles where id = auth.uid())
    and vendor_status = (select vendor_status from public.profiles where id = auth.uid())
  );

-- UPDATE admin total
create policy "profiles_update_admin"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

-- DELETE admin seulement
create policy "profiles_delete_admin"
  on public.profiles for delete
  using (public.is_admin());

-- Fonction demande vendeur
create or replace function public.request_vendor_access()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set vendor_status = 'pending',
      vendor_requested_at = now()
  where id = auth.uid()
    and vendor_status in ('none', 'suspended');
end;
$$;

-- Fonction approbation vendeur par admin
create or replace function public.approve_vendor(vendor_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Acces refuse admin uniquement';
  end if;

  update public.profiles
  set vendor_status = 'approved',
      vendor_approved_at = now()
  where id = vendor_id
    and vendor_status = 'pending';
end;
$$;

-- Fonction suspension vendeur par admin
create or replace function public.suspend_vendor(vendor_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Acces refuse admin uniquement';
  end if;

  update public.profiles
  set vendor_status = 'suspended'
  where id = vendor_id;
end;
$$;
