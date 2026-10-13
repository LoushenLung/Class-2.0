-- =============================================================================
-- RPL 1 WEB KELAS — SUPABASE FULL SETUP SCRIPT
-- =============================================================================
-- Jalankan seluruh file ini di: Supabase Dashboard → SQL Editor → New Query
--
-- URUTAN EKSEKUSI:
--   STEP 1 → Buat semua tabel (public schema)
--   STEP 2 → Buat views
--   STEP 3 → RLS helper functions
--   STEP 4 → Aktifkan RLS + policies
--   STEP 5 → Trigger: auto-create profile saat user baru mendaftar
--   STEP 6 → Seed: buat 3 akun auth + profile dengan masing-masing role
-- =============================================================================


-- =============================================================================
-- STEP 1 — TABLES
-- =============================================================================

-- ── users ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID        PRIMARY KEY,
  email       TEXT        UNIQUE NOT NULL,
  name        TEXT        NOT NULL,
  role        TEXT        NOT NULL DEFAULT 'murid', -- 'admin' | 'bendahara' | 'murid'
  "avatarUrl" TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS users_role_idx ON public.users (role);

-- ── dues_periods (Periode Iuran Kas) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.dues_periods (
  id          TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name        TEXT        NOT NULL,
  amount      INT         NOT NULL,
  start_date  TIMESTAMPTZ NOT NULL,
  end_date    TIMESTAMPTZ NOT NULL,
  is_archived BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS dues_periods_is_archived_idx ON public.dues_periods (is_archived);
CREATE INDEX IF NOT EXISTS dues_periods_start_date_idx  ON public.dues_periods (start_date);

-- ── dues_payments (Pembayaran Iuran per Siswa) ───────────────────────────────
CREATE TABLE IF NOT EXISTS public.dues_payments (
  id                        TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  student_id                UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  due_period_id             TEXT        NOT NULL REFERENCES public.dues_periods(id) ON DELETE CASCADE,
  status                    TEXT        NOT NULL DEFAULT 'pending',
  proof_image_url           TEXT,
  proof_image_cloudinary_id TEXT,
  paid_at                   TIMESTAMPTZ,
  notes                     TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, due_period_id)
);

CREATE INDEX IF NOT EXISTS dues_payments_status_idx     ON public.dues_payments (status);
CREATE INDEX IF NOT EXISTS dues_payments_student_id_idx ON public.dues_payments (student_id);

-- ── announcements (Pengumuman) ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.announcements (
  id           TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title        TEXT        NOT NULL,
  content      TEXT        NOT NULL,
  author_id    UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status       TEXT        NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS announcements_status_idx       ON public.announcements (status);
CREATE INDEX IF NOT EXISTS announcements_published_at_idx ON public.announcements (published_at);

-- ── schedule (Jadwal Pelajaran) ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.schedule (
  id           TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  day_of_week  INT         NOT NULL,
  period_order INT         NOT NULL,
  period_label TEXT        NOT NULL,
  subject      TEXT,
  teacher      TEXT,
  room         TEXT,
  is_break     BOOLEAN     NOT NULL DEFAULT FALSE,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (day_of_week, period_order)
);

CREATE INDEX IF NOT EXISTS schedule_day_of_week_idx ON public.schedule (day_of_week);

-- ── photo_galleries + photos (Galeri Momen) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.photo_galleries (
  id          TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title       TEXT        NOT NULL,
  description TEXT,
  event_date  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS photo_galleries_event_date_idx ON public.photo_galleries (event_date);

CREATE TABLE IF NOT EXISTS public.photos (
  id             TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  gallery_id     TEXT        NOT NULL REFERENCES public.photo_galleries(id) ON DELETE CASCADE,
  cloudinary_url TEXT        NOT NULL,
  cloudinary_id  TEXT        NOT NULL,
  caption        TEXT,
  uploaded_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS photos_gallery_id_idx ON public.photos (gallery_id);

-- ── audit_log ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_log (
  id         TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id    UUID        REFERENCES public.users(id) ON DELETE SET NULL,
  action     TEXT        NOT NULL,
  table_name TEXT        NOT NULL,
  record_id  TEXT        NOT NULL,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS audit_log_user_id_idx    ON public.audit_log (user_id);
CREATE INDEX IF NOT EXISTS audit_log_action_idx     ON public.audit_log (action);
CREATE INDEX IF NOT EXISTS audit_log_created_at_idx ON public.audit_log (created_at);

-- ── attendances (Presensi) ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.attendances (
  id            TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  student_id    UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date          DATE        NOT NULL,
  status        TEXT        NOT NULL,
  check_in_time TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, date)
);

CREATE INDEX IF NOT EXISTS attendances_date_idx ON public.attendances (date);

-- ── materials (Materi & Modul) ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.materials (
  id            TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title         TEXT        NOT NULL,
  subject_name  TEXT        NOT NULL,
  description   TEXT,
  file_url      TEXT,
  cloudinary_id TEXT,
  external_link TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS materials_subject_name_idx ON public.materials (subject_name);

-- ── forum_posts + forum_comments (Forum Diskusi) ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.forum_posts (
  id            TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title         TEXT        NOT NULL,
  content       TEXT        NOT NULL,
  created_by_id UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS forum_posts_created_at_idx ON public.forum_posts (created_at);

CREATE TABLE IF NOT EXISTS public.forum_comments (
  id            TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  post_id       TEXT        NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  content       TEXT        NOT NULL,
  created_by_id UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  is_answer     BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS forum_comments_post_id_idx ON public.forum_comments (post_id);

-- ── cash_transactions (Kas Umum Kelas) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cash_transactions (
  id            TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title         TEXT        NOT NULL,
  amount        INT         NOT NULL,
  type          TEXT        NOT NULL,
  category      TEXT,
  description   TEXT,
  created_by_id UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS cash_transactions_type_idx       ON public.cash_transactions (type);
CREATE INDEX IF NOT EXISTS cash_transactions_created_at_idx ON public.cash_transactions (created_at);


-- =============================================================================
-- STEP 2 — VIEWS
-- =============================================================================

CREATE OR REPLACE VIEW public.dues_summary AS
SELECT
  dp.id,
  dp.student_id,
  u.name,
  u.email,
  dp.due_period_id AS period_id,
  dper.name        AS period_name,
  dper.amount,
  dp.status,
  dp.paid_at,
  dp.proof_image_url
FROM public.dues_payments dp
JOIN public.users          u    ON u.id    = dp.student_id
JOIN public.dues_periods   dper ON dper.id = dp.due_period_id
WHERE dper.is_archived = FALSE;


-- =============================================================================
-- STEP 3 — RLS HELPER FUNCTIONS
-- =============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN FALSE; END IF;
  RETURN EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin');
END;
$$;

CREATE OR REPLACE FUNCTION public.is_treasurer_or_admin()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN FALSE; END IF;
  RETURN EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('bendahara', 'admin'));
END;
$$;


-- =============================================================================
-- STEP 4 — ENABLE RLS + GRANT + POLICIES
-- =============================================================================

ALTER TABLE public.users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dues_periods      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dues_payments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_galleries   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendances       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_transactions ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.users FROM anon, authenticated;
GRANT SELECT (id, email, name, role, "avatarUrl", created_at, updated_at)
  ON TABLE public.users TO authenticated;
GRANT UPDATE (name, "avatarUrl") ON TABLE public.users TO authenticated;

-- users
DROP POLICY IF EXISTS "users: select own"       ON public.users;
DROP POLICY IF EXISTS "users: admin select all"  ON public.users;
DROP POLICY IF EXISTS "users: update own"        ON public.users;
DROP POLICY IF EXISTS "users: admin update all"  ON public.users;
DROP POLICY IF EXISTS "users: no direct insert"  ON public.users;
CREATE POLICY "users: select own"       ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users: admin select all" ON public.users FOR SELECT USING (is_admin());
CREATE POLICY "users: update own"       ON public.users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "users: admin update all" ON public.users FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "users: no direct insert" ON public.users FOR INSERT WITH CHECK (FALSE);

-- dues_periods
DROP POLICY IF EXISTS "dues_periods: all select active"    ON public.dues_periods;
DROP POLICY IF EXISTS "dues_periods: treasurer select all" ON public.dues_periods;
DROP POLICY IF EXISTS "dues_periods: treasurer insert"     ON public.dues_periods;
DROP POLICY IF EXISTS "dues_periods: treasurer update"     ON public.dues_periods;
CREATE POLICY "dues_periods: all select active"    ON public.dues_periods FOR SELECT USING (auth.uid() IS NOT NULL AND NOT is_archived);
CREATE POLICY "dues_periods: treasurer select all" ON public.dues_periods FOR SELECT USING (is_treasurer_or_admin());
CREATE POLICY "dues_periods: treasurer insert"     ON public.dues_periods FOR INSERT WITH CHECK (is_treasurer_or_admin());
CREATE POLICY "dues_periods: treasurer update"     ON public.dues_periods FOR UPDATE USING (is_treasurer_or_admin()) WITH CHECK (is_treasurer_or_admin());

-- dues_payments
DROP POLICY IF EXISTS "dues_payments: student select own"   ON public.dues_payments;
DROP POLICY IF EXISTS "dues_payments: treasurer select all" ON public.dues_payments;
DROP POLICY IF EXISTS "dues_payments: treasurer insert"     ON public.dues_payments;
DROP POLICY IF EXISTS "dues_payments: treasurer update"     ON public.dues_payments;
DROP POLICY IF EXISTS "dues_payments: no delete"            ON public.dues_payments;
CREATE POLICY "dues_payments: student select own"   ON public.dues_payments FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "dues_payments: treasurer select all" ON public.dues_payments FOR SELECT USING (is_treasurer_or_admin());
CREATE POLICY "dues_payments: treasurer insert"     ON public.dues_payments FOR INSERT WITH CHECK (is_treasurer_or_admin());
CREATE POLICY "dues_payments: treasurer update"     ON public.dues_payments FOR UPDATE USING (is_treasurer_or_admin()) WITH CHECK (is_treasurer_or_admin());
CREATE POLICY "dues_payments: no delete"            ON public.dues_payments FOR DELETE USING (FALSE);

-- announcements
DROP POLICY IF EXISTS "announcements: all select published"       ON public.announcements;
DROP POLICY IF EXISTS "announcements: treasurer select all"       ON public.announcements;
DROP POLICY IF EXISTS "announcements: treasurer insert"           ON public.announcements;
DROP POLICY IF EXISTS "announcements: treasurer or author update" ON public.announcements;
DROP POLICY IF EXISTS "announcements: treasurer or author delete" ON public.announcements;
CREATE POLICY "announcements: all select published"       ON public.announcements FOR SELECT USING (auth.uid() IS NOT NULL AND status = 'published');
CREATE POLICY "announcements: treasurer select all"       ON public.announcements FOR SELECT USING (is_treasurer_or_admin());
CREATE POLICY "announcements: treasurer insert"           ON public.announcements FOR INSERT WITH CHECK (is_treasurer_or_admin() OR author_id = auth.uid());
CREATE POLICY "announcements: treasurer or author update" ON public.announcements FOR UPDATE USING (is_treasurer_or_admin() OR author_id = auth.uid()) WITH CHECK (is_treasurer_or_admin() OR author_id = auth.uid());
CREATE POLICY "announcements: treasurer or author delete" ON public.announcements FOR DELETE USING (is_treasurer_or_admin() OR author_id = auth.uid());

-- schedule
DROP POLICY IF EXISTS "schedule: all select"       ON public.schedule;
DROP POLICY IF EXISTS "schedule: treasurer insert"  ON public.schedule;
DROP POLICY IF EXISTS "schedule: treasurer update"  ON public.schedule;
DROP POLICY IF EXISTS "schedule: treasurer delete"  ON public.schedule;
CREATE POLICY "schedule: all select"       ON public.schedule FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "schedule: treasurer insert" ON public.schedule FOR INSERT WITH CHECK (is_treasurer_or_admin());
CREATE POLICY "schedule: treasurer update" ON public.schedule FOR UPDATE USING (is_treasurer_or_admin()) WITH CHECK (is_treasurer_or_admin());
CREATE POLICY "schedule: treasurer delete" ON public.schedule FOR DELETE USING (is_treasurer_or_admin());

-- photo_galleries + photos
DROP POLICY IF EXISTS "photo_galleries: all select"      ON public.photo_galleries;
DROP POLICY IF EXISTS "photo_galleries: treasurer write"  ON public.photo_galleries;
DROP POLICY IF EXISTS "photos: all select"               ON public.photos;
DROP POLICY IF EXISTS "photos: treasurer write"          ON public.photos;
CREATE POLICY "photo_galleries: all select"      ON public.photo_galleries FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "photo_galleries: treasurer write"  ON public.photo_galleries FOR ALL USING (is_treasurer_or_admin()) WITH CHECK (is_treasurer_or_admin());
CREATE POLICY "photos: all select"               ON public.photos FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "photos: treasurer write"          ON public.photos FOR ALL USING (is_treasurer_or_admin()) WITH CHECK (is_treasurer_or_admin());

-- audit_log
DROP POLICY IF EXISTS "audit_log: admin select"     ON public.audit_log;
DROP POLICY IF EXISTS "audit_log: no direct insert" ON public.audit_log;
DROP POLICY IF EXISTS "audit_log: no direct update" ON public.audit_log;
DROP POLICY IF EXISTS "audit_log: no direct delete" ON public.audit_log;
CREATE POLICY "audit_log: admin select"     ON public.audit_log FOR SELECT USING (is_admin());
CREATE POLICY "audit_log: no direct insert" ON public.audit_log FOR INSERT WITH CHECK (FALSE);
CREATE POLICY "audit_log: no direct update" ON public.audit_log FOR UPDATE USING (FALSE);
CREATE POLICY "audit_log: no direct delete" ON public.audit_log FOR DELETE USING (FALSE);

-- attendances
DROP POLICY IF EXISTS "attendances: student select own" ON public.attendances;
DROP POLICY IF EXISTS "attendances: treasurer all"      ON public.attendances;
CREATE POLICY "attendances: student select own" ON public.attendances FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "attendances: treasurer all"      ON public.attendances FOR ALL USING (is_treasurer_or_admin()) WITH CHECK (is_treasurer_or_admin());

-- materials
DROP POLICY IF EXISTS "materials: all select"      ON public.materials;
DROP POLICY IF EXISTS "materials: treasurer write"  ON public.materials;
CREATE POLICY "materials: all select"      ON public.materials FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "materials: treasurer write"  ON public.materials FOR ALL USING (is_treasurer_or_admin()) WITH CHECK (is_treasurer_or_admin());

-- forum_posts
DROP POLICY IF EXISTS "forum_posts: all select"               ON public.forum_posts;
DROP POLICY IF EXISTS "forum_posts: all insert"               ON public.forum_posts;
DROP POLICY IF EXISTS "forum_posts: author or treasurer delete" ON public.forum_posts;
CREATE POLICY "forum_posts: all select"               ON public.forum_posts FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "forum_posts: all insert"               ON public.forum_posts FOR INSERT WITH CHECK (created_by_id = auth.uid());
CREATE POLICY "forum_posts: author or treasurer delete" ON public.forum_posts FOR DELETE USING (created_by_id = auth.uid() OR is_treasurer_or_admin());

-- forum_comments
DROP POLICY IF EXISTS "forum_comments: all select"               ON public.forum_comments;
DROP POLICY IF EXISTS "forum_comments: all insert"               ON public.forum_comments;
DROP POLICY IF EXISTS "forum_comments: author or treasurer delete" ON public.forum_comments;
DROP POLICY IF EXISTS "forum_comments: treasurer update"         ON public.forum_comments;
CREATE POLICY "forum_comments: all select"               ON public.forum_comments FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "forum_comments: all insert"               ON public.forum_comments FOR INSERT WITH CHECK (created_by_id = auth.uid());
CREATE POLICY "forum_comments: author or treasurer delete" ON public.forum_comments FOR DELETE USING (created_by_id = auth.uid() OR is_treasurer_or_admin());
CREATE POLICY "forum_comments: treasurer update"         ON public.forum_comments FOR UPDATE USING (is_treasurer_or_admin()) WITH CHECK (is_treasurer_or_admin());

-- cash_transactions
DROP POLICY IF EXISTS "cash_transactions: all select"      ON public.cash_transactions;
DROP POLICY IF EXISTS "cash_transactions: treasurer write"  ON public.cash_transactions;
CREATE POLICY "cash_transactions: all select"      ON public.cash_transactions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "cash_transactions: treasurer write"  ON public.cash_transactions FOR ALL USING (is_treasurer_or_admin()) WITH CHECK (is_treasurer_or_admin());


-- =============================================================================
-- STEP 5 — TRIGGERS
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''), split_part(NEW.email, '@', 1)),
    'murid',
    NOW(), NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Audit trigger
CREATE OR REPLACE FUNCTION public.audit_dues_payment()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_action   TEXT;
  v_old_vals JSONB;
  v_new_vals JSONB;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_action := 'payment_created'; v_old_vals := NULL;       v_new_vals := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'payment_updated'; v_old_vals := to_jsonb(OLD); v_new_vals := to_jsonb(NEW);
  ELSE
    v_action := 'payment_deleted'; v_old_vals := to_jsonb(OLD); v_new_vals := NULL;
  END IF;
  INSERT INTO public.audit_log (id, user_id, action, table_name, record_id, old_values, new_values, created_at)
  VALUES (gen_random_uuid()::text, auth.uid(), v_action, 'dues_payments', COALESCE(NEW.id, OLD.id), v_old_vals, v_new_vals, NOW());
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS audit_dues_payment_changes ON public.dues_payments;
CREATE TRIGGER audit_dues_payment_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.dues_payments
  FOR EACH ROW EXECUTE FUNCTION public.audit_dues_payment();


-- =============================================================================
-- STEP 6 — SEED: 3 AKUN (admin, bendahara, murid)
-- =============================================================================
-- Akun seed untuk development & testing.
-- Ganti password jika akan digunakan di production!
--
--  ADMIN     → admin@rpl1.test       / Admin@1234
--  BENDAHARA → bendahara@rpl1.test   / Bendahara@1234
--  SISWA     → siswa@rpl1.test       / Siswa@1234
-- =============================================================================

DO $$
DECLARE
  v_admin_id     UUID;
  v_bendahara_id UUID;
  v_murid_id     UUID;
BEGIN

  -- ── Admin ─────────────────────────────────────────────────────────────────
  SELECT id INTO v_admin_id FROM auth.users WHERE email = 'admin@rpl1.test';
  IF v_admin_id IS NULL THEN
    v_admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token
    ) VALUES (
      v_admin_id, '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated',
      'admin@rpl1.test', crypt('Admin@1234', gen_salt('bf')),
      NOW(), '{"name":"Admin RPL 1"}'::jsonb,
      NOW(), NOW(), '', ''
    );
  END IF;
  INSERT INTO public.users (id, email, name, role, created_at, updated_at)
  VALUES (v_admin_id, 'admin@rpl1.test', 'Admin RPL 1', 'admin', NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET role = 'admin', name = 'Admin RPL 1', updated_at = NOW();

  -- ── Bendahara ─────────────────────────────────────────────────────────────
  SELECT id INTO v_bendahara_id FROM auth.users WHERE email = 'bendahara@rpl1.test';
  IF v_bendahara_id IS NULL THEN
    v_bendahara_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token
    ) VALUES (
      v_bendahara_id, '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated',
      'bendahara@rpl1.test', crypt('Bendahara@1234', gen_salt('bf')),
      NOW(), '{"name":"Bendahara RPL 1"}'::jsonb,
      NOW(), NOW(), '', ''
    );
  END IF;
  INSERT INTO public.users (id, email, name, role, created_at, updated_at)
  VALUES (v_bendahara_id, 'bendahara@rpl1.test', 'Bendahara RPL 1', 'bendahara', NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET role = 'bendahara', name = 'Bendahara RPL 1', updated_at = NOW();

  -- ── Siswa / Murid ─────────────────────────────────────────────────────────
  SELECT id INTO v_murid_id FROM auth.users WHERE email = 'siswa@rpl1.test';
  IF v_murid_id IS NULL THEN
    v_murid_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token
    ) VALUES (
      v_murid_id, '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated',
      'siswa@rpl1.test', crypt('Siswa@1234', gen_salt('bf')),
      NOW(), '{"name":"Budi Santoso"}'::jsonb,
      NOW(), NOW(), '', ''
    );
  END IF;
  INSERT INTO public.users (id, email, name, role, created_at, updated_at)
  VALUES (v_murid_id, 'siswa@rpl1.test', 'Budi Santoso', 'murid', NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET role = 'murid', name = 'Budi Santoso', updated_at = NOW();

  RAISE NOTICE '=== SEED SELESAI ===';
  RAISE NOTICE 'Admin     | email: admin@rpl1.test      | password: Admin@1234';
  RAISE NOTICE 'Bendahara | email: bendahara@rpl1.test  | password: Bendahara@1234';
  RAISE NOTICE 'Siswa     | email: siswa@rpl1.test      | password: Siswa@1234';

END;
$$;

-- =============================================================================
-- VERIFIKASI: Jalankan query ini terpisah untuk memastikan berhasil
-- =============================================================================
-- SELECT id, email, name, role, created_at FROM public.users ORDER BY role;
