-- CHAKRISEBA BD — PRODUCTION POSTGRESQL SCHEMA
CREATE TABLE IF NOT EXISTS candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    name_bn VARCHAR(255) NOT NULL,
    father_name VARCHAR(255),
    mother_name VARCHAR(255),
    dob DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    nid VARCHAR(50) UNIQUE,
    district VARCHAR(100),
    present_address TEXT,
    permanent_address TEXT,
    nationality VARCHAR(50) DEFAULT 'Bangladeshi',
    marital_status VARCHAR(20) DEFAULT 'single',
    photo_storage_key VARCHAR(500),
    signature_storage_key VARCHAR(500),
    quota VARCHAR(50) DEFAULT 'none',
    quota_certificate_key VARCHAR(500),
    role VARCHAR(20) DEFAULT 'candidate',
    wallet_balance NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS candidate_education (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    level VARCHAR(50) NOT NULL,
    degree VARCHAR(255) NOT NULL,
    board_or_uni VARCHAR(255) NOT NULL,
    roll VARCHAR(50),
    reg VARCHAR(50),
    passing_year VARCHAR(10) NOT NULL,
    result VARCHAR(50) NOT NULL,
    major_subject VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS candidate_experience (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    designation VARCHAR(255) NOT NULL,
    organization VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    responsibilities TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS candidate_training (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    institute VARCHAR(255) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    completion_year VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS candidate_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    dimensions VARCHAR(50),
    mime_type VARCHAR(100) NOT NULL,
    storage_key VARCHAR(500) NOT NULL UNIQUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS saved_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    job_id VARCHAR(100) NOT NULL,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_saved_job UNIQUE(candidate_id, job_id)
);
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_no VARCHAR(50) UNIQUE NOT NULL,
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE RESTRICT,
    job_id VARCHAR(100) NOT NULL,
    job_title VARCHAR(255) NOT NULL,
    organization VARCHAR(255) NOT NULL,
    post_name VARCHAR(255) NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    trx_id VARCHAR(100),
    status VARCHAR(50) DEFAULT 'draft',
    verification_type VARCHAR(50) DEFAULT 'user_reported',
    teletalk_tracking_id VARCHAR(100),
    applicant_copy_url VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS application_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    verification_type VARCHAR(50) NOT NULL,
    notes TEXT,
    actor_role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_no VARCHAR(50) UNIQUE NOT NULL,
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE RESTRICT,
    amount NUMERIC(10, 2) NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    provider_trx_id VARCHAR(100),
    idempotency_key VARCHAR(100) UNIQUE,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    link VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS job_alert_preferences (
    candidate_id UUID PRIMARY KEY REFERENCES candidates(id) ON DELETE CASCADE,
    categories TEXT[] DEFAULT '{}',
    districts TEXT[] DEFAULT '{}',
    grades TEXT[] DEFAULT '{}',
    email_alert BOOLEAN DEFAULT TRUE,
    sms_alert BOOLEAN DEFAULT FALSE,
    frequency VARCHAR(20) DEFAULT 'daily'
);
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- MILESTONE 2: COUPON & RAFFLE DDL (REFERENCE)
-- ==========================================

CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('fixed', 'percentage')),
    discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value >= 0),
    min_service_charge NUMERIC(10, 2) DEFAULT 0.00 CHECK (min_service_charge >= 0),
    max_discount_cap NUMERIC(10, 2),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'expired')),
    global_usage_limit INT,
    used_count INT DEFAULT 0,
    per_candidate_limit INT DEFAULT 1,
    new_candidate_only BOOLEAN DEFAULT FALSE,
    allow_combine_with_raffle BOOLEAN DEFAULT TRUE,
    total_budget NUMERIC(12, 2),
    used_budget NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_coupons_code_upper ON coupons (UPPER(code));

CREATE TABLE IF NOT EXISTS raffle_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    bonus_type VARCHAR(20) NOT NULL CHECK (bonus_type IN ('fixed', 'percentage')),
    bonus_value NUMERIC(10, 2) NOT NULL CHECK (bonus_value >= 0),
    min_service_charge NUMERIC(10, 2) DEFAULT 0.00 CHECK (min_service_charge >= 0),
    max_bonus_per_order NUMERIC(10, 2) NOT NULL,
    total_budget NUMERIC(12, 2),
    used_budget NUMERIC(12, 2) DEFAULT 0.00,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'ended')),
    has_service_discount BOOLEAN DEFAULT TRUE,
    has_prize_draw BOOLEAN DEFAULT FALSE,
    allow_combine_with_coupon BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS coupon_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE RESTRICT,
    coupon_code VARCHAR(50) NOT NULL,
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE RESTRICT,
    order_id UUID NOT NULL REFERENCES applications(id) ON DELETE RESTRICT,
    discount_amount NUMERIC(10, 2) NOT NULL CHECK (discount_amount >= 0),
    service_charge_before_discount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'committed' CHECK (status IN ('reserved', 'committed', 'released')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_coupon_order_redemption UNIQUE(coupon_id, order_id)
);

CREATE TABLE IF NOT EXISTS raffle_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES raffle_campaigns(id) ON DELETE RESTRICT,
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE RESTRICT,
    order_id UUID NOT NULL REFERENCES applications(id) ON DELETE RESTRICT,
    bonus_awarded NUMERIC(10, 2) DEFAULT 0.00 CHECK (bonus_awarded >= 0),
    has_prize_draw_entry BOOLEAN DEFAULT FALSE,
    ticket_number VARCHAR(100),
    status VARCHAR(20) DEFAULT 'committed' CHECK (status IN ('reserved', 'committed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_raffle_order_entry UNIQUE(campaign_id, order_id)
);

-- Financial Snapshot Fields on Applications (Reference Documentation)
-- ALTER TABLE applications ADD COLUMN IF NOT EXISTS government_application_fee NUMERIC(10, 2);
-- ALTER TABLE applications ADD COLUMN IF NOT EXISTS service_charge NUMERIC(10, 2);
-- ALTER TABLE applications ADD COLUMN IF NOT EXISTS raffle_bonus_discount NUMERIC(10, 2) DEFAULT 0.00;
-- ALTER TABLE applications ADD COLUMN IF NOT EXISTS coupon_discount NUMERIC(10, 2) DEFAULT 0.00;
-- ALTER TABLE applications ADD COLUMN IF NOT EXISTS final_service_charge NUMERIC(10, 2);
-- ALTER TABLE applications ADD COLUMN IF NOT EXISTS snapshot_created_at TIMESTAMP WITH TIME ZONE;
-- ALTER TABLE applications ADD COLUMN IF NOT EXISTS is_immutable BOOLEAN DEFAULT FALSE;
