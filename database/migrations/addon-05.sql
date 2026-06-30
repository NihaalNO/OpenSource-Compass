create table if not exists public.repository_intelligence (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  repository_id uuid not null references public.github_repositories(id) on delete cascade,
  provider text not null default 'github',
  knowledge_package jsonb not null,
  source_limits jsonb,
  detected_stack jsonb,
  contribution_readiness jsonb,
  complexity jsonb,
  status text not null default 'completed' check (status in ('pending', 'completed', 'failed')),
  error_message text,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, repository_id, provider)
);

create index if not exists idx_repository_intelligence_user_generated
  on public.repository_intelligence(user_id, generated_at desc);

create index if not exists idx_repository_intelligence_repository_status
  on public.repository_intelligence(repository_id, status);

create index if not exists idx_repository_intelligence_detected_stack
  on public.repository_intelligence using gin(detected_stack);

drop trigger if exists set_repository_intelligence_updated_at on public.repository_intelligence;
create trigger set_repository_intelligence_updated_at
  before update on public.repository_intelligence
  for each row
  execute function public.set_updated_at();

alter table public.repository_intelligence enable row level security;

drop policy if exists "Users can read own repository intelligence" on public.repository_intelligence;
drop policy if exists "Users can manage own repository intelligence" on public.repository_intelligence;

create policy "Users can read own repository intelligence"
  on public.repository_intelligence
  for select
  using (auth.uid() = user_id);

create policy "Users can manage own repository intelligence"
  on public.repository_intelligence
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
