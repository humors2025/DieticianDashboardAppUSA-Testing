-- ============================================================
-- SCHEMA PROPOSAL v3 — ID MIGRATION + ROLE HIERARCHY + REFERRAL
-- Prepared for: Monday May 19, 2026 session with Chandan
-- DB: dietician_db
-- NOTE: Do NOT run against live DB. For review only.
-- ============================================================
--
-- v3 CHANGES:
--   - app_users is now a THIN role/hierarchy table only
--   - NO profile data (name, email, password, phone, dob, etc.)
--   - Profile stays in table_dietician / table_clients — zero duplication
--   - Login: JOIN app_users (role/hierarchy) + old table (credentials/profile)
--   - Super Admin confirmed: connect@respyr.in / RespyrD01 / OfficeHQ
--
-- v2 CHANGES (carried forward):
--   - ZERO ALTER STATEMENTS on existing tables
--   - Only NEW tables created
--   - Old APIs 100% untouched
--
-- ============================================================
-- FRONTEND CONTRACT (from user.js normalizeUser):
--   user_id, role, first_name, last_name, email, phone,
--   partner_code, parent_user_id, is_reset_password,
--   email_verified_at
--
-- NOTE: Frontend expects all these fields in the login response.
-- Backend builds this response by JOINing app_users + old table:
--   - role, parent_user_id, partner_code, status → from app_users
--   - first_name, last_name, email, phone, is_reset_password → from old table
-- ============================================================


-- ############################################################
-- PART A: THIN ROLE/HIERARCHY TABLE (NEW — no duplication)
-- ############################################################
-- Stores ONLY identity + hierarchy. No profile data.
-- Profile/credentials stay in table_dietician / table_clients.
--
-- Login flow (dietician_login.php):
--   1. Receive email + password
--   2. Check table_dietician for credentials (existing logic, unchanged)
--   3. If valid, JOIN app_users ON id_map to get role + hierarchy
--   4. Build response: merge old table fields + app_users fields
--   5. Return both res.user (new) + res.dietician (legacy)
--   6. Frontend persistLoginResponse() handles both shapes already
-- ############################################################

CREATE TABLE `app_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(50) NOT NULL COMMENT 'New business ID e.g. OfficeHQ, EvanG',
  `role` enum('super_admin','trainer_admin','trainer','client') NOT NULL,
  `partner_code` varchar(50) DEFAULT NULL COMMENT 'Public-facing code e.g. EVAN2026',
  `parent_user_id` varchar(50) DEFAULT NULL COMMENT 'FK → app_users.user_id. Hierarchy chain: SA→TA→Trainer→Client',
  `status` enum('active','suspended','inactive') NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_id` (`user_id`),
  KEY `idx_role` (`role`),
  KEY `idx_parent` (`parent_user_id`),
  KEY `idx_partner_code` (`partner_code`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- SEED: Super Admin (confirmed by Chandan)
INSERT INTO `app_users` (`user_id`, `role`, `partner_code`, `parent_user_id`, `status`) VALUES
('OfficeHQ', 'super_admin', 'OfficeHQ', NULL, 'active');

-- SEED: Existing trainers (Chandan to confirm user_id values + who is TA vs Trainer)
-- parent_user_id TBD — depends on Q3: which trainers report to which TA
INSERT INTO `app_users` (`user_id`, `role`, `partner_code`, `parent_user_id`, `status`) VALUES
('GayatriR',  'trainer', 'GayatriR',  NULL, 'active'),   -- RespyrD02, parent TBD
('SagarH',    'trainer', 'SagarH',    NULL, 'active'),   -- RespyrD03, parent TBD
('AnkurJ',    'trainer', 'AnkurJ',    NULL, 'active'),   -- RespyrD04, parent TBD
('EvanG',     'trainer', 'EvanG',     NULL, 'active'),   -- RespyrD05, parent TBD (or trainer_admin?)
('DerekL',    'trainer', 'DerekL',    NULL, 'active'),   -- RespyrD06, parent TBD (or trainer_admin?)
('TannerB',   'trainer', 'TannerB',   NULL, 'active'),   -- RespyrD07, parent TBD
('TeddyR',    'trainer', 'TeddyR',    NULL, 'active'),   -- RespyrD08, parent TBD
('SagarH2',   'trainer', 'SagarH2',   NULL, 'active'),   -- RespyrD09, needs unique ID from Chandan
('SophiaL',   'trainer', 'SophiaL',   NULL, 'active'),   -- RespyrD10, parent TBD
('SachineD',  'trainer', 'SachineD',  NULL, 'active');   -- RespyrD11, parent TBD


-- ############################################################
-- PART B: ID MAPPING (legacy ↔ new) — NEW TABLE
-- ############################################################
-- Bridges old IDs to new user_ids. Critical for the JOIN
-- between app_users and old tables.
--
-- Example login JOIN:
--   SELECT au.role, au.parent_user_id, au.partner_code, au.status,
--          d.name, d.email, d.phone_no, d.password, d.is_reset_password
--   FROM app_users au
--   JOIN id_map m ON m.new_user_id = au.user_id
--   JOIN table_dietician d ON d.dietician_id = m.legacy_id
--   WHERE d.email = ?
-- ############################################################

CREATE TABLE `id_map` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `legacy_table` enum('table_dietician','table_clients') NOT NULL,
  `legacy_id` varchar(50) NOT NULL COMMENT 'e.g. RespyrD01 or profile257',
  `new_user_id` varchar(50) NOT NULL COMMENT 'FK → app_users.user_id',
  `migrated` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1 once fully migrated',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_legacy` (`legacy_table`, `legacy_id`),
  UNIQUE KEY `uq_new_user` (`legacy_table`, `new_user_id`),
  KEY `idx_new_user_id` (`new_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- SEED: Map old dietician_id → new user_id
INSERT INTO `id_map` (`legacy_table`, `legacy_id`, `new_user_id`) VALUES
('table_dietician', 'RespyrD01', 'OfficeHQ'),   -- OFFICE → Super Admin
('table_dietician', 'RespyrD02', 'GayatriR'),   -- Gayatri
('table_dietician', 'RespyrD03', 'SagarH'),     -- Sagar
('table_dietician', 'RespyrD04', 'AnkurJ'),     -- Ankur Jaiswal
('table_dietician', 'RespyrD05', 'EvanG'),      -- Evan
('table_dietician', 'RespyrD06', 'DerekL'),     -- Derek
('table_dietician', 'RespyrD07', 'TannerB'),    -- Tanner
('table_dietician', 'RespyrD08', 'TeddyR'),     -- Teddy
('table_dietician', 'RespyrD09', 'SagarH2'),    -- Sagar12 (needs Chandan input)
('table_dietician', 'RespyrD10', 'SophiaL'),    -- Sophia
('table_dietician', 'RespyrD11', 'SachineD');   -- Sachine

-- Client mappings (profile_id → new user_id) to be added Monday
-- INSERT INTO id_map (legacy_table, legacy_id, new_user_id) VALUES
-- ('table_clients', 'profile257', '<new_client_id>');


-- EXISTING TABLES THAT STILL USE OLD IDs (ALL UNTOUCHED):
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
-- │ food_suggestion_weekly          │ dietitian_id     │ varchar(60)  │
-- │ table_dietitian_link_requests   │ dietitian_id     │ varchar(50)  │
-- │ table_diet_plan_strategy        │ dietitian_id     │ varchar(15)  │
-- │ table_test_data                 │ dietitian_id     │ varchar(15)  │
-- └─────────────────────────────────┴──────────────────┴──────────────┘
-- Profile data (name, email, password, phone, etc.) lives HERE.
-- app_users only stores role + hierarchy. No duplication.


-- ############################################################
-- PART C: REFERRAL SYSTEM (NEW TABLES ONLY)
-- ############################################################

-- C1. REFERRAL CODES
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

-- C2. REFERRAL TRANSACTIONS
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

-- C3. REFERRAL REWARDS
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
-- PART D: AUDIT LOG (NEW TABLE ONLY)
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
  `from_value` varchar(100) DEFAULT NULL COMMENT 'e.g. previous role',
  `to_value` varchar(100) DEFAULT NULL COMMENT 'e.g. new role',
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
-- PART E: CONFLICT & DUPLICATION CHECK
-- ############################################################
--
-- NEW tables (6):           NONE exist in dietician_db ✓
-- EXISTING tables altered:  NONE (0) ✓
-- DATA DUPLICATION:         NONE ✓
--   app_users stores: user_id, role, partner_code, parent_user_id, status
--   Old tables store:  name, email, password, phone, profile data
--   Zero overlap.
--
-- RISK TO EXISTING APIs:    ZERO ✓
--   Old APIs never query these 6 new tables.
--
-- ############################################################


-- ############################################################
-- REMAINING QUESTIONS FOR CHANDAN (Monday session)
-- ############################################################
--
-- ANSWERED:
--   ✅ Q2: Super Admin = connect@respyr.in / RespyrD01 / OfficeHQ
--   ✅ app_users = thin table (Option A), no profile duplication
--
-- STILL OPEN:
--   Q1: Confirm new user_id for each of the 11 dieticians
--       (especially RespyrD09/Sagar12)
--   Q3: Which trainers → trainer_admin? (Evan + Derek = TA in demo data)
--   Q4: New user_id format for clients? (profile257 → ?)
--   Q5: partner_code = user_id or separate value?
--
--   Q6–Q11: Referral flow (who refers whom, rewards, code format, etc.)
--   Q12: Login API update — add app_users JOIN to dietician_login.php?
--   Q13: Flutter app auth against app_users or web-only for now?
-- ############################################################
