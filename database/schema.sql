CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL UNIQUE,
  full_name text NOT NULL,
  university text NOT NULL DEFAULT '',
  college text NOT NULL DEFAULT '',
  department text NOT NULL DEFAULT '',
  stage text NOT NULL DEFAULT 'stage_1',
  referral_code text NOT NULL UNIQUE DEFAULT upper(encode(gen_random_bytes(6), 'hex')),
  referred_by_code text REFERENCES users(referral_code) ON DELETE SET NULL,
  loyalty_points integer NOT NULL DEFAULT 0 CHECK (loyalty_points >= 0),
  total_earned_points integer NOT NULL DEFAULT 0 CHECK (total_earned_points >= 0),
  daily_streak integer NOT NULL DEFAULT 0 CHECK (daily_streak >= 0),
  last_check_in_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  admin_id uuid,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (user_id IS NOT NULL OR admin_id IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS academic_coordinators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text NOT NULL DEFAULT '',
  role text NOT NULL,
  specialty text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS services (
  id text PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  base_price_iqd bigint NOT NULL CHECK (base_price_iqd >= 0),
  min_duration_hours integer NOT NULL DEFAULT 0 CHECK (min_duration_hours >= 0),
  enabled boolean NOT NULL DEFAULT true,
  configuration jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pricing_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price_iqd bigint NOT NULL CHECK (price_iqd >= 0),
  price_percent numeric(6, 3) CHECK (price_percent IS NULL OR price_percent BETWEEN 0 AND 1000),
  enabled boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_percent numeric(5, 2) CHECK (discount_percent IS NULL OR discount_percent BETWEEN 0 AND 100),
  discount_amount_iqd bigint CHECK (discount_amount_iqd IS NULL OR discount_amount_iqd >= 0),
  max_discount_iqd bigint CHECK (max_discount_iqd IS NULL OR max_discount_iqd >= 0),
  max_uses integer CHECK (max_uses IS NULL OR max_uses > 0),
  max_uses_per_student integer CHECK (max_uses_per_student IS NULL OR max_uses_per_student > 0),
  use_count integer NOT NULL DEFAULT 0 CHECK (use_count >= 0),
  active boolean NOT NULL DEFAULT true,
  label text NOT NULL,
  note text NOT NULL DEFAULT '',
  created_by uuid REFERENCES admins(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (code = upper(trim(code))),
  CHECK (
    (discount_type = 'percent' AND discount_percent IS NOT NULL AND discount_amount_iqd IS NULL) OR
    (discount_type = 'fixed' AND discount_amount_iqd IS NOT NULL AND discount_percent IS NULL)
  )
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  student_id uuid REFERENCES users(id) ON DELETE SET NULL,
  student_name text NOT NULL,
  student_phone text NOT NULL,
  service_id text REFERENCES services(id) ON DELETE SET NULL,
  coupon_id uuid REFERENCES coupons(id) ON DELETE SET NULL,
  assigned_coordinator_id uuid REFERENCES academic_coordinators(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'awaiting_payment',
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  subtotal_iqd bigint NOT NULL CHECK (subtotal_iqd >= 0),
  discount_iqd bigint NOT NULL DEFAULT 0 CHECK (discount_iqd >= 0),
  total_iqd bigint NOT NULL CHECK (total_iqd >= 0),
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS orders_student_created_idx ON orders(student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS orders_phone_created_idx ON orders(student_phone, created_at DESC);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);

CREATE TABLE IF NOT EXISTS receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  receipt_number text NOT NULL UNIQUE,
  snapshot jsonb NOT NULL,
  issued_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS receipt_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id uuid NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity numeric(12, 3) NOT NULL DEFAULT 1 CHECK (quantity > 0),
  amount_iqd bigint NOT NULL,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS points_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  title text NOT NULL,
  points integer NOT NULL CHECK (points <> 0),
  transaction_type text NOT NULL CHECK (transaction_type IN ('earn', 'redeem', 'bonus')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS points_user_created_idx ON points_transactions(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  attendance_date date NOT NULL DEFAULT current_date,
  points_awarded integer NOT NULL DEFAULT 0 CHECK (points_awarded >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, attendance_date)
);

CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  referral_code text NOT NULL,
  reward_points integer NOT NULL DEFAULT 0 CHECK (reward_points >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (referrer_id <> referred_user_id)
);

CREATE TABLE IF NOT EXISTS coupon_usages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid NOT NULL REFERENCES coupons(id) ON DELETE RESTRICT,
  student_id uuid REFERENCES users(id) ON DELETE SET NULL,
  order_id uuid NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  discount_iqd bigint NOT NULL CHECK (discount_iqd >= 0),
  used_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS coupon_usages_student_idx ON coupon_usages(coupon_id, student_id);

CREATE OR REPLACE FUNCTION consume_coupon(
  p_code text,
  p_student_id uuid,
  p_order_id uuid,
  p_discount_iqd bigint
) RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  selected_coupon coupons%ROWTYPE;
  student_uses integer;
  order_subtotal bigint;
BEGIN
  SELECT * INTO selected_coupon
  FROM coupons
  WHERE code = upper(trim(p_code)) AND active
  FOR UPDATE;

  IF NOT FOUND OR p_discount_iqd < 0 THEN
    RETURN false;
  END IF;

  SELECT subtotal_iqd INTO order_subtotal
  FROM orders
  WHERE id = p_order_id
    AND coupon_id = selected_coupon.id
    AND student_id IS NOT DISTINCT FROM p_student_id
  FOR UPDATE;

  IF NOT FOUND OR p_discount_iqd > order_subtotal OR
     (selected_coupon.max_discount_iqd IS NOT NULL AND p_discount_iqd > selected_coupon.max_discount_iqd) THEN
    RETURN false;
  END IF;

  IF selected_coupon.max_uses IS NOT NULL AND selected_coupon.use_count >= selected_coupon.max_uses THEN
    RETURN false;
  END IF;

  IF selected_coupon.max_uses_per_student IS NOT NULL AND p_student_id IS NOT NULL THEN
    SELECT count(*) INTO student_uses
    FROM coupon_usages
    WHERE coupon_id = selected_coupon.id AND student_id = p_student_id;

    IF student_uses >= selected_coupon.max_uses_per_student THEN
      RETURN false;
    END IF;
  END IF;

  UPDATE coupons
  SET use_count = use_count + 1
  WHERE id = selected_coupon.id;

  INSERT INTO coupon_usages(coupon_id, student_id, order_id, discount_iqd)
  VALUES (selected_coupon.id, p_student_id, p_order_id, p_discount_iqd);

  RETURN true;
END;
$$;