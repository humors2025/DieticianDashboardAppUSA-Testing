-- ============================================================
-- SCHEMA PROPOSAL — ID MIGRATION + ROLE HIERARCHY + REFERRAL
-- Prepared for: Monday May 19, 2026 session with Chandan
-- DB: dietician_db
-- NOTE: Do NOT run against live DB. For review only.
-- ============================================================
--
-- FRONTEND CONTRACT (from user.js normalizeUser):
--   user_id, role, first_name, last_name, email, phone,
--   partner_code, parent_user_id, is_reset_password,
--   email_verified_at
--
-- FRONTEND ROLES (from user.js ROLES):
--   super_admin, trainer_admin, trainer, client
--
-- FRONTEND ROUTING (from user.js landingPathForUser):
--   super_admin   → /super-admin/overview
--   trainer_admin → /trainer-admin/overview
--   trainer       → /trainer/dashboard
--   client        → / (app only)
--
-- DEMO DATA FIELDS (from demo-data.js):
--   TRAINER_ADMINS: id, first_name, last_name, email, phone,
--                   partner_code, status, created_at
--   TRAINERS:       id, first_name, last_name, email, partner_code,
--                   parent_user_id, status, created_at
--   CLIENTS:        id, first_name, last_name, email,
--                   parent_user_id, tier, amount_paid, status,
--                   subscribed_at
-- ============================================================


-- ############################################################
-- PART A: UNIFIED USERS TABLE
-- ############################################################
-- One table for all roles. The backend login endpoint returns a
-- row from here; the frontend reads `role` to route + render.
-- This replaces the need for separate super_admins / trainer_admins
-- / trainers / users tables and ensures dietician_login.php can
-- resolve any role from one query.
--
-- The EXISTING tables (table_dietician, table_clients) stay
-- untouched. New code writes to both during the transition.
-- ############################################################

CREATE TABLE `app_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,

  -- Matches user.js normalizeUser() contract exactly
  `user_id` varchar(50) NOT NULL COMMENT 'Primary business ID. New format e.g. IshanS, EvanG',
  `role` enum('super_admin','trainer_admin','trainer','client') NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL DEFAULT '',
  `email` varchar(150) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `partner_code` varchar(50) DEFAULT NULL COMMENT 'Public-facing code e.g. EVAN2026. For trainers = trainer_id format',
  `parent_user_id` varchar(50) DEFAULT NULL COMMENT 'FK → app_users.user_id. trainer_admin for trainers, trainer for clients',

  -- Auth
  `password` text NOT NULL,
  `is_reset_password` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0 = must change on first login',
  `email_verified_at` datetime DEFAULT NULL,

  -- Status
  `status` enum('active','suspended','inactive') NOT NULL DEFAULT 'active',

  -- Profile (carried over from table_clients for client role)
  `profile_image` longblob,
  `dob` varchar(50) DEFAULT NULL,
  `age` varchar(10) DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `height` varchar(10) DEFAULT NULL,
  `weight` varchar(10) DEFAULT NULL,
  `region` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,

  -- Trainer-specific (carried over from table_dietician)
  `logo` longblob,

  -- Client-specific
  `tier` enum('coach','lease','owned') DEFAULT NULL COMMENT 'Subscription tier, only for role=client',
  `is_trainer_linked` tinyint(1) DEFAULT '0',
  `is_notification_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `level_type` tinyint(4) NOT NULL DEFAULT '1',

  -- Timestamps
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_id` (`user_id`),
  UNIQUE KEY `uq_email_role` (`email`, `role`),
  KEY `idx_role` (`role`),
  KEY `idx_parent` (`parent_user_id`),
  KEY `idx_partner_code` (`partner_code`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ############################################################
-- PART B: ID MAPPING (legacy ↔ new)
-- ############################################################
-- Maps old dietician_id/profile_id to new app_users.user_id.
-- Backend JOINs on this during transition so 11 existing tables
-- continue working with their old column names unchanged.
-- ############################################################

CREATE TABLE `id_map` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `legacy_table` enum('table_dietician','table_clients') NOT NULL,
  `legacy_id` varchar(50) NOT NULL COMMENT 'e.g. RespyrD01 or profile257',
  `new_user_id` varchar(50) NOT NULL COMMENT 'FK → app_users.user_id',
  `migrated` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1 once all references updated in legacy table',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_legacy` (`legacy_table`, `legacy_id`),
  UNIQUE KEY `uq_new_user` (`legacy_table`, `new_user_id`),
  KEY `idx_new_user_id` (`new_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed: existing 11 dieticians → trainers
-- Chandan to confirm the new user_id / partner_code values
INSERT INTO `id_map` (`legacy_table`, `legacy_id`, `new_user_id`) VALUES
('table_dietician', 'RespyrD01', 'OfficeHQ'),
('table_dietician', 'RespyrD02', 'GayatriR'),
('table_dietician', 'RespyrD03', 'SagarH'),
('table_dietician', 'RespyrD04', 'AnkurJ'),
('table_dietician', 'RespyrD05', 'EvanG'),
('table_dietician', 'RespyrD06', 'DerekL'),
('table_dietician', 'RespyrD07', 'TannerB'),
('table_dietician', 'RespyrD08', 'TeddyR'),
('table_dietician', 'RespyrD09', 'SagarH2'),   -- duplicate first name with RespyrD03, needs Chandan input
('table_dietician', 'RespyrD10', 'SophiaL'),
('table_dietician', 'RespyrD11', 'SachineD');

-- Corresponding app_users rows for existing trainers
-- (password migrated from table_dietician, email from there too)
-- This is a TEMPLATE — actual insert uses data from table_dietician
--
-- INSERT INTO `app_users` (user_id, role, first_name, last_name, email, phone, partner_code, parent_user_id, password, is_reset_password, status, location, logo, created_at)
-- SELECT
--   m.new_user_id,
--   'trainer',
--   SUBSTRING_INDEX(d.name, ' ', 1),
--   IF(LOCATE(' ', d.name) > 0, SUBSTRING(d.name, LOCATE(' ', d.name) + 1), ''),
--   d.email,
--   d.phone_no,
--   m.new_user_id,          -- partner_code = user_id for trainers
--   NULL,                    -- parent_user_id: Chandan to assign trainer_admin
--   d.password,
--   d.is_reset_password,
--   'active',
--   d.location,
--   d.logo,
--   d.dttm
-- FROM table_dietician d
-- JOIN id_map m ON m.legacy_id = d.dietician_id AND m.legacy_table = 'table_dietician';


-- TABLES THAT REFERENCE OLD dietician_id / dietitian_id (11 total):
-- ┌─────────────────────────────────┬──────────────────┬──────────────┐
-- │ Table                           │ Column           │ Width        │
-- ├─────────────────────────────────┼──────────────────┼──────────────┤
-- │ table_dietician                 │ dietician_id     │ varchar(10)  │
-- │ table_clients                   │ dietician_id     │ varchar(10)  │
-- │ table_chat_threads              │ dietician_id     │ varchar(50)  │
-- │ client_subscriptions            │ dietician_id     │ varchar(50)  │
-- │ features_allow                  │ dietician_id     │ varchar(25)  │
-- │ table_dietitian_test_counts     │ dietician_id     │ varchar(15)  │
-- │ table_food_log                  │ dietician_id     │ varchar(15)  │
-- │ food_suggestion_weekly          │ dietitian_id     │ varchar(60)  │ ← spelling
-- │ table_dietitian_link_requests   │ dietitian_id     │ varchar(50)  │ ← spelling
-- │ table_diet_plan_strategy        │ dietitian_id     │ varchar(15)  │
-- │ table_test_data                 │ dietitian_id     │ varchar(15)  │
-- └─────────────────────────────────┴──────────────────┴──────────────┘
--
-- MIGRATION STRATEGY (no existing table is modified until Phase 3):
--   Phase 0 (now):  Create app_users + id_map. Seed trainers.
--                   dietician_login.php returns BOTH legacy + new shape.
--                   Frontend already handles both (persistLoginResponse).
--   Phase 1:        Backend APIs start reading from app_users for auth.
--                   Data APIs still query legacy tables via id_map JOIN.
--   Phase 2:        Add trainer_id column (nullable) to each of the 11
--                   legacy tables. Backfill from id_map.
--   Phase 3:        Swap all queries to trainer_id. Drop old columns.


-- ############################################################
-- PART C: ALTER EXISTING TABLES (non-breaking additions only)
-- ############################################################
-- Add columns to existing tables that the frontend already needs.
-- All are nullable → no existing row breaks.
-- ############################################################

-- C1. table_dietician: add role + parent + status columns
--     so the login endpoint can return the full user.js shape
--     even before full migration to app_users.
ALTER TABLE `table_dietician`
  ADD COLUMN `role` enum('super_admin','trainer_admin','trainer') NOT NULL DEFAULT 'trainer' AFTER `is_reset_password`,
  ADD COLUMN `first_name` varchar(100) DEFAULT NULL AFTER `role`,
  ADD COLUMN `last_name` varchar(100) DEFAULT NULL AFTER `first_name`,
  ADD COLUMN `partner_code` varchar(50) DEFAULT NULL AFTER `last_name`,
  ADD COLUMN `parent_user_id` varchar(50) DEFAULT NULL AFTER `partner_code` COMMENT 'FK → app_users.user_id of their trainer_admin',
  ADD COLUMN `status` enum('active','suspended','inactive') NOT NULL DEFAULT 'active' AFTER `parent_user_id`,
  ADD COLUMN `email_verified_at` datetime DEFAULT NULL AFTER `status`;

-- Backfill first_name / last_name from existing name column
-- UPDATE table_dietician SET
--   first_name = SUBSTRING_INDEX(name, ' ', 1),
--   last_name  = IF(LOCATE(' ', name) > 0, SUBSTRING(name, LOCATE(' ', name) + 1), ''),
--   partner_code = dietician_id;

-- C2. table_clients: add tier + status for client shape
ALTER TABLE `table_clients`
  ADD COLUMN `first_name` varchar(100) DEFAULT NULL AFTER `profile_name`,
  ADD COLUMN `last_name` varchar(100) DEFAULT NULL AFTER `first_name`,
  ADD COLUMN `tier` enum('coach','lease','owned') DEFAULT NULL AFTER `last_name`,
  ADD COLUMN `status` enum('active','suspended','past_due','inactive') NOT NULL DEFAULT 'active' AFTER `tier`;

-- Backfill first_name / last_name from profile_name
-- UPDATE table_clients SET
--   first_name = SUBSTRING_INDEX(profile_name, ' ', 1),
--   last_name  = IF(LOCATE(' ', profile_name) > 0, SUBSTRING(profile_name, LOCATE(' ', profile_name) + 1), '');

-- C3. otp_verifications: add role so OTP works for all hierarchy levels
ALTER TABLE `otp_verifications`
  ADD COLUMN `role` enum('super_admin','trainer_admin','trainer','client') DEFAULT 'client' AFTER `email`,
  ADD COLUMN `user_id` varchar(50) DEFAULT NULL AFTER `role`;

-- C4. app_refresh_token: currently uses int user_id (table_clients.id).
--     Add varchar column for new app_users.user_id alongside.
ALTER TABLE `app_refresh_token`
  ADD COLUMN `app_user_id` varchar(50) DEFAULT NULL AFTER `user_id` COMMENT 'FK → app_users.user_id. Nullable during transition.',
  ADD COLUMN `role` enum('super_admin','trainer_admin','trainer','client') DEFAULT NULL AFTER `app_user_id`;

-- C5. table_fcm_tokens: currently uses profile_id as user_id varchar.
--     Add role column so push works for all hierarchy levels.
ALTER TABLE `table_fcm_tokens`
  ADD COLUMN `role` enum('super_admin','trainer_admin','trainer','client') DEFAULT 'client' AFTER `user_id`;

-- C6. coupon_codes: add referral as a source
ALTER TABLE `coupon_codes`
  MODIFY COLUMN `coupon_source` enum('coach','website','referral') NOT NULL,
  ADD COLUMN `referral_code_id` int(11) DEFAULT NULL AFTER `coupon_source`;


-- ############################################################
-- PART D: REFERRAL SYSTEM
-- ############################################################

-- D1. REFERRAL CODES
CREATE TABLE `referral_codes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `referral_code` varchar(20) NOT NULL,
  `owner_role` enum('super_admin','trainer_admin','trainer','client') NOT NULL,
  `owner_user_id` varchar(50) NOT NULL COMMENT 'FK → app_users.user_id',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `max_uses` int(11) DEFAULT NULL COMMENT 'NULL = unlimited',
  `times_used` int(11) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_referral_code` (`referral_code`),
  KEY `idx_owner` (`owner_role`, `owner_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- D2. REFERRAL TRANSACTIONS
CREATE TABLE `referral_transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `referral_code_id` int(11) NOT NULL COMMENT 'FK → referral_codes.id',
  `referrer_user_id` varchar(50) NOT NULL COMMENT 'FK → app_users.user_id',
  `referrer_role` enum('super_admin','trainer_admin','trainer','client') NOT NULL,
  `referee_user_id` varchar(50) NOT NULL COMMENT 'FK → app_users.user_id',
  `referee_role` enum('trainer_admin','trainer','client') NOT NULL,
  `event_type` enum('signup','subscription','device_purchase') NOT NULL DEFAULT 'signup',
  `subscription_id` int(11) DEFAULT NULL COMMENT 'FK → client_subscriptions.id if applicable',
  `status` enum('pending','credited','expired','cancelled') NOT NULL DEFAULT 'pending',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_referral_code` (`referral_code_id`),
  KEY `idx_referrer` (`referrer_user_id`),
  KEY `idx_referee` (`referee_user_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- D3. REFERRAL REWARDS
CREATE TABLE `referral_rewards` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `transaction_id` int(11) NOT NULL COMMENT 'FK → referral_transactions.id',
  `beneficiary_user_id` varchar(50) NOT NULL COMMENT 'FK → app_users.user_id',
  `beneficiary_role` enum('super_admin','trainer_admin','trainer','client') NOT NULL,
  `reward_type` enum('subscription_extension','discount','cashback','free_tests') NOT NULL,
  `reward_value` varchar(100) NOT NULL COMMENT 'e.g. 30 for days, 20 for percent',
  `reward_unit` enum('days','percent','amount','count') NOT NULL,
  `status` enum('pending','applied','expired') NOT NULL DEFAULT 'pending',
  `applied_at` datetime DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_transaction` (`transaction_id`),
  KEY `idx_beneficiary` (`beneficiary_user_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ############################################################
-- PART E: AUDIT LOG
-- ############################################################
-- Required per user lifecycle rules: every privileged action logged.
-- EditRoleDialog.jsx already sends: userId, fromRole, toRole,
-- actorUserId, actorName, reason, targetName.
-- ############################################################

CREATE TABLE `audit_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `actor_user_id` varchar(50) NOT NULL COMMENT 'FK → app_users.user_id',
  `actor_role` enum('super_admin','trainer_admin','trainer','client','system') NOT NULL,
  `actor_name` varchar(200) DEFAULT NULL,
  `action` varchar(100) NOT NULL COMMENT 'e.g. change_role, suspend, reattribute, create_referral_code',
  `target_user_id` varchar(50) DEFAULT NULL COMMENT 'FK → app_users.user_id',
  `target_role` enum('super_admin','trainer_admin','trainer','client') DEFAULT NULL,
  `target_name` varchar(200) DEFAULT NULL,
  `from_value` varchar(100) DEFAULT NULL COMMENT 'e.g. previous role for change_role',
  `to_value` varchar(100) DEFAULT NULL COMMENT 'e.g. new role for change_role',
  `reason` text DEFAULT NULL,
  `details` json DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_actor` (`actor_user_id`),
  KEY `idx_target` (`target_user_id`),
  KEY `idx_action` (`action`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ############################################################
-- PART F: CONFLICT CHECK — TABLE/COLUMN NAME COLLISIONS
-- ############################################################
-- New tables created in this migration:
--   app_users              ✓ does not exist in dietician_db
--   id_map                 ✓ does not exist
--   referral_codes         ✓ does not exist
--   referral_transactions  ✓ does not exist
--   referral_rewards       ✓ does not exist
--   audit_log              ✓ does not exist
--
-- Columns added to EXISTING tables (all nullable, non-breaking):
--   table_dietician:
--     role                 ✓ column does not exist
--     first_name           ✓ column does not exist
--     last_name            ✓ column does not exist
--     partner_code         ✓ column does not exist
--     parent_user_id       ✓ column does not exist
--     status               ✓ column does not exist
--     email_verified_at    ✓ column does not exist
--   table_clients:
--     first_name           ✓ column does not exist
--     last_name            ✓ column does not exist
--     tier                 ✓ column does not exist
--     status               ✓ column does not exist
--   otp_verifications:
--     role                 ✓ column does not exist
--     user_id              ✓ column does not exist
--   app_refresh_token:
--     app_user_id          ✓ column does not exist
--     role                 ✓ column does not exist
--   table_fcm_tokens:
--     role                 ✓ column does not exist
--   coupon_codes:
--     coupon_source        enum extended (coach,website → coach,website,referral)
--     referral_code_id     ✓ column does not exist
--
-- NO existing columns are renamed or dropped.
-- NO existing tables are renamed or dropped.
-- NO default values on existing columns change.
-- ALL new columns are nullable or have safe defaults.
-- ############################################################


-- ############################################################
-- QUESTIONS FOR CHANDAN (Monday session)
-- ############################################################
--
-- MAPPING / IDENTITY:
--   Q1: Confirm new user_id for each of the 11 dieticians
--       (especially RespyrD09/Sagar12 — duplicate name with RespyrD03/Sagar)
--   Q2: Who are the initial super_admin(s)?
--       (need user_id, email, name to seed into app_users)
--   Q3: Which trainers map to which trainer_admin (parent_user_id)?
--       Evan (RespyrD05) and Derek (RespyrD06) are TAs in demo-data.
--       Do we promote them in the real data too?
--   Q4: New user_id format for clients? (profile257 → what?)
--   Q5: Should partner_code = user_id for trainers, or a separate
--       value? (demo-data uses EVAN2026 style)
--
-- REFERRAL FLOW:
--   Q6: Who can refer whom?
--       a) Trainer → Client only
--       b) Client → Client only
--       c) Trainer Admin → Trainer
--       d) All of the above
--   Q7: Reward model — what does the referrer get?
--       (subscription extension / discount / free tests / cashback)
--   Q8: When is referral "credited"?
--       (on signup / on first subscription / on first test)
--   Q9: Referral code format?
--       (auto e.g. RSPREF-A3X9K2 / custom e.g. DRJOHN / both)
--   Q10: Integrate with existing coupon_codes table or keep separate?
--   Q11: Deep link for sharing? (respyr.ai/refer/CODE → app store / web)
--
-- AUTH:
--   Q12: dietician_login.php — can we add a `role` check there so it
--        queries app_users first, falls back to table_dietician?
--        Frontend already reads both res.user and res.dietician.
--   Q13: Does app (Flutter) need to auth against app_users too,
--        or only web dashboard for now?
-- ############################################################
