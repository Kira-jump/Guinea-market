# Base de données ShopGN

Migrations SQL versionnées, à exécuter dans l'ordre dans le **SQL Editor** de Supabase.

## Ordre d'exécution

| # | Fichier | Couche | Description |
|---|---------|--------|-------------|
| 1 | `migrations/001_profiles.sql` | Identité | Table `profiles` + statuts vendeur + RLS + fonctions admin |

## Comment appliquer une migration

1. Aller sur supabase.com → ton projet → **SQL Editor**
2. **New query** → copier-coller le contenu du fichier `.sql`
3. **Run** → vérifier qu'il n'y a pas d'erreur

## Promouvoir un utilisateur admin (à faire une fois après inscription)

```sql
update public.profiles
set is_admin = true
where id = (select id from auth.users where email = 'ton.email@exemple.com');
```

## Vérifier la couche 1

```sql
-- Inscription depuis l'app → un row doit apparaître automatiquement
select id, prenom, nom, vendor_status, is_admin from public.profiles;

-- Demande vendeur (en étant connecté côté app)
select public.request_vendor_access();

-- Validation admin
select public.approve_vendor('<uuid-du-vendeur>');
```
