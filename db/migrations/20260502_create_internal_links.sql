-- Migration: create internal_links table
create table if not exists public.internal_links (
  id uuid not null default gen_random_uuid(),
  from_post_id uuid null,
  to_post_id uuid null,
  anchor_text character varying not null,
  position integer null,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  constraint internal_links_pkey primary key (id),
  constraint internal_links_from_post_id_fkey foreign key (from_post_id) references posts (id) on delete CASCADE,
  constraint internal_links_to_post_id_fkey foreign key (to_post_id) references posts (id) on delete CASCADE
) tablespace pg_default;

create index if not exists idx_internal_from on public.internal_links using btree (from_post_id) tablespace pg_default;
create index if not exists idx_internal_to on public.internal_links using btree (to_post_id) tablespace pg_default;
