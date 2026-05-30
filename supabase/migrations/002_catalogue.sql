/* ======= CLEANUP idempotent : permet de re-run 002 sans erreur ======= */
drop function if exists public.pin_boutique(uuid, int);
drop function if exists public.unpin_boutique(uuid);
drop function if exists public.pin_produit(uuid, int);
drop function if exists public.unpin_produit(uuid);
drop function if exists public.maj_followers_count() cascade;
drop table if exists public.followers cascade;
drop table if exists public.produits cascade;
drop table if exists public.boutiques cascade;
drop type if exists produit_categorie;

/* ======= CREATION ======= */

/* Categories autorisees */
create type produit_categorie as enum (
  'vetements', 'electronique', 'alimentation', 'beaute', 'maison',
  'chaussures', 'bijoux', 'sport', 'sante', 'autre'
);

/* Table boutiques : 1 boutique par vendeur approuve */
create table public.boutiques (
  id                  uuid primary key default gen_random_uuid(),
  vendeur_id          uuid not null unique references public.profiles(id) on delete cascade,
  nom                 text not null,
  description         text,
  whatsapp            text,
  logo_url            text,
  followers_count     int not null default 0,
  epinglee            boolean not null default false,
  epinglee_position   int,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index boutiques_vendeur_idx on public.boutiques(vendeur_id);
create index boutiques_epinglee_idx on public.boutiques(epinglee) where epinglee = true;

/* Table produits */
create table public.produits (
  id                  uuid primary key default gen_random_uuid(),
  boutique_id         uuid not null references public.boutiques(id) on delete cascade,
  nom                 text not null,
  description         text,
  prix                numeric(12,2) not null check (prix >= 0),
  image_url           text,
  categorie           produit_categorie not null,
  epingle             boolean not null default false,
  epingle_position    int,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index produits_boutique_idx on public.produits(boutique_id);
create index produits_categorie_idx on public.produits(categorie);
create index produits_epingle_idx on public.produits(epingle) where epingle = true;

/* Table followers */
create table public.followers (
  user_id      uuid not null references public.profiles(id) on delete cascade,
  boutique_id  uuid not null references public.boutiques(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (user_id, boutique_id)
);

create index followers_boutique_idx on public.followers(boutique_id);

/* Triggers updated_at */
create trigger boutiques_set_updated_at before update on public.boutiques for each row execute function public.set_updated_at();
create trigger produits_set_updated_at before update on public.produits for each row execute function public.set_updated_at();

/* Trigger maintien compteur followers_count */
create or replace function public.maj_followers_count()
returns trigger language plpgsql as $body$
begin
  if tg_op = 'INSERT' then
    update public.boutiques set followers_count = followers_count + 1 where id = new.boutique_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.boutiques set followers_count = greatest(0, followers_count - 1) where id = old.boutique_id;
    return old;
  end if;
  return null;
end;
$body$;

create trigger followers_count_trigger after insert or delete on public.followers for each row execute function public.maj_followers_count();

/* Activation RLS */
alter table public.boutiques enable row level security;
alter table public.produits enable row level security;
alter table public.followers enable row level security;

/* BOUTIQUES lecture publique */
create policy "boutiques_select_public" on public.boutiques for select using (true);

/* BOUTIQUES creation reservee vendeur approuve */
create policy "boutiques_insert_approved_vendor" on public.boutiques for insert with check (
  auth.uid() = vendeur_id
  and (select vendor_status from public.profiles where id = auth.uid()) = 'approved'
);

/* BOUTIQUES update proprietaire */
create policy "boutiques_update_own" on public.boutiques for update
  using (auth.uid() = vendeur_id)
  with check (auth.uid() = vendeur_id);

/* BOUTIQUES admin update total */
create policy "boutiques_update_admin" on public.boutiques for update using (public.is_admin()) with check (public.is_admin());

/* BOUTIQUES delete proprietaire ou admin */
create policy "boutiques_delete_own_or_admin" on public.boutiques for delete using (auth.uid() = vendeur_id or public.is_admin());

/* PRODUITS lecture publique */
create policy "produits_select_public" on public.produits for select using (true);

/* PRODUITS creation par proprietaire boutique */
create policy "produits_insert_own_boutique" on public.produits for insert with check (
  boutique_id in (select id from public.boutiques where vendeur_id = auth.uid())
);

/* PRODUITS update proprietaire */
create policy "produits_update_own" on public.produits for update
  using (boutique_id in (select id from public.boutiques where vendeur_id = auth.uid()))
  with check (boutique_id in (select id from public.boutiques where vendeur_id = auth.uid()));

/* PRODUITS admin update total */
create policy "produits_update_admin" on public.produits for update using (public.is_admin()) with check (public.is_admin());

/* PRODUITS delete proprietaire ou admin */
create policy "produits_delete_own_or_admin" on public.produits for delete using (
  boutique_id in (select id from public.boutiques where vendeur_id = auth.uid()) or public.is_admin()
);

/* FOLLOWERS lecture self ou vendeur ou admin */
create policy "followers_select_self_or_owner" on public.followers for select using (
  user_id = auth.uid()
  or boutique_id in (select id from public.boutiques where vendeur_id = auth.uid())
  or public.is_admin()
);

/* FOLLOWERS insert self */
create policy "followers_insert_self" on public.followers for insert with check (user_id = auth.uid());

/* FOLLOWERS delete self ou admin */
create policy "followers_delete_self" on public.followers for delete using (user_id = auth.uid() or public.is_admin());

/* Fonctions admin epinglage */
create or replace function public.pin_boutique(b_id uuid, pos int default null)
returns void language plpgsql security definer set search_path = public as $body$
begin
  if not public.is_admin() then raise exception 'Acces refuse admin uniquement'; end if;
  update public.boutiques set epinglee = true, epinglee_position = coalesce(pos, extract(epoch from now())::int) where id = b_id;
end;
$body$;

create or replace function public.unpin_boutique(b_id uuid)
returns void language plpgsql security definer set search_path = public as $body$
begin
  if not public.is_admin() then raise exception 'Acces refuse admin uniquement'; end if;
  update public.boutiques set epinglee = false, epinglee_position = null where id = b_id;
end;
$body$;

create or replace function public.pin_produit(p_id uuid, pos int default null)
returns void language plpgsql security definer set search_path = public as $body$
begin
  if not public.is_admin() then raise exception 'Acces refuse admin uniquement'; end if;
  update public.produits set epingle = true, epingle_position = coalesce(pos, extract(epoch from now())::int) where id = p_id;
end;
$body$;

create or replace function public.unpin_produit(p_id uuid)
returns void language plpgsql security definer set search_path = public as $body$
begin
  if not public.is_admin() then raise exception 'Acces refuse admin uniquement'; end if;
  update public.produits set epingle = false, epingle_position = null where id = p_id;
end;
$body$;
