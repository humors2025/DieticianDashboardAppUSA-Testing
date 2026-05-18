# Table Operations Matrix — v2 Schema (New Tables Only)

> **For Monday May 19 session with Chandan**
> Maps each of the 6 new tables to: which UI screen uses it, web vs app, and what CRUD operations it performs.
> No existing table is touched. Old APIs stay as-is.

---

## How the bridge works

```
NEW FLOW (hierarchy/referral):
  Web/App → New API → app_users / referral_codes / audit_log

OLD FLOW (test data, diet plans, food log, etc.):
  Web/App → Old API → table_dietician / table_clients / table_test_data / etc.

CROSS-REFERENCE (when new flow needs old data):
  New API → id_map JOIN → old table
  Example: app_users.user_id "EvanG" → id_map → "RespyrD05" → table_test_data
```

---

## Table 1: `app_users`

> Unified identity for all roles. Login endpoint queries this first, falls back to legacy tables.

| Screen | Platform | Route / File | Role | Operation | What happens |
|--------|----------|-------------|------|-----------|-------------|
| **Login** | Web | `/login` → `login-form.jsx` | All | **READ** | `dietician_login.php` checks `app_users` by email first. Returns `res.user` with role, user_id, partner_code, parent_user_id. Frontend `persistLoginResponse()` writes both `user` + `dietician` cookies. |
| **Login** | App (Flutter) | `sign_in_with_email.dart` / `email_otp.dart` | Client | **READ** | Same endpoint. App stores `ClientProfileModel` in SharedPreferences. |
| **First-login password gate** | Web | `/trainer/updatepassword` | Trainer | **UPDATE** | If `is_reset_password = 0`, user forced to set password before getting access_token. |
| **Super Admin → Overview** | Web | `/super-admin/overview` | Super Admin | **READ** | Counts all app_users by role. KPIs: total TAs, trainers, clients, active subscriptions. |
| **Super Admin → Trainer Admins list** | Web | `/super-admin/trainer-admins` | Super Admin | **READ** | `SELECT * FROM app_users WHERE role = 'trainer_admin'`. Shows name, email, phone, partner_code, status, created_at. |
| **Super Admin → Trainer Admin detail** | Web | `/super-admin/trainer-admins/[id]` | Super Admin | **READ** | Single TA + their trainers (`WHERE parent_user_id = ta.user_id AND role = 'trainer'`). |
| **Super Admin → Trainers list** | Web | `/super-admin/trainers` | Super Admin | **READ** | `SELECT * FROM app_users WHERE role = 'trainer'`. Filter by parent_user_id (TA), status, search by name/email/partner_code. |
| **Super Admin → Trainer detail** | Web | `/super-admin/trainers/[id]` | Super Admin | **READ** | Single trainer + their clients (`WHERE parent_user_id = trainer.user_id AND role = 'client'`). |
| **Super Admin → Clients list** | Web | `/super-admin/clients` | Super Admin | **READ** | `SELECT * FROM app_users WHERE role = 'client'`. Filter by tier, trainer, status. |
| **Super Admin → Client detail** | Web | `/super-admin/clients/[id]` | Super Admin | **READ** | Single client profile. |
| **Super Admin → Edit Role** | Web | `EditRoleDialog.jsx` | Super Admin | **UPDATE** | Changes `app_users.role` for target user. Also writes to `audit_log`. |
| **Super Admin → Suspend/Reinstate** | Web | `SuspensionDialog.jsx` | Super Admin | **UPDATE** | Sets `app_users.status = 'suspended'` or `'active'`. Writes to `audit_log`. |
| **Super Admin → Reattribute Client** | Web | `ReattributeDialog.jsx` | Super Admin | **UPDATE** | Changes `app_users.parent_user_id` for a client (moves to different trainer). Writes to `audit_log`. |
| **Trainer Admin → Overview** | Web | `/trainer-admin/overview` | Trainer Admin | **READ** | Scoped: only `WHERE parent_user_id = currentUser.user_id`. Shows my trainers, my network's clients, override commission. No peer TA data visible. |
| **Trainer Admin → My Trainers** | Web | `/trainer-admin/trainers` | Trainer Admin | **READ** | `WHERE parent_user_id = me.user_id AND role = 'trainer'`. |
| **Trainer Admin → Invite Trainer** | Web | `/trainer-admin/trainers` (invite form) | Trainer Admin | **INSERT** | Creates new `app_users` row with `role = 'trainer'`, `parent_user_id = me.user_id`, `is_reset_password = 0`, `status = 'active'`. Sends invite email. |
| **Trainer Admin → Settings** | Web | `/trainer-admin/settings` | Trainer Admin | **UPDATE** | Edit own profile (first_name, last_name, phone, email). |
| **Trainer → Dashboard** | Web | `/trainer/dashboard` | Trainer | **READ** | Fetch own clients: `WHERE parent_user_id = me.user_id AND role = 'client'`. |
| **Trainer → Settings** | Web | `/trainer/settings` | Trainer | **UPDATE** | Edit own profile. |
| **Trainer → Earnings** | Web | `/trainer/earnings/overview` | Trainer | **READ** | Read own partner_code, client count, tier breakdown. |
| **Client Onboarding** | App (Flutter) | `profile_info_screen.dart` (multi-step) | Client | **INSERT** | Creates `app_users` row with `role = 'client'`, profile fields (dob, gender, height, weight, region, etc.). |
| **Client → Select Dietician** | App (Flutter) | `dietician_screen.dart` | Client | **UPDATE** | Sets `parent_user_id` (trainer) and `is_trainer_linked = 1`. |
| **Client → Account Settings** | App (Flutter) | `account_setting_screen.dart` | Client | **READ** | Display name, email, phone (read-only). |
| **Client → Change Password** | App (Flutter) | `change_password_screen.dart` | Client | **UPDATE** | Update password field. |
| **Client → Delete Account** | App (Flutter) | `account_delete_screen.dart` | Client | **UPDATE** | Set `status = 'inactive'` (no hard delete per lifecycle rules). |

**Summary: app_users**
- **INSERT**: Invite trainer (TA web), Client onboarding (app), Super admin creates SA/TA
- **READ**: Login (all), every dashboard/list page (web), client profile (app)
- **UPDATE**: Edit own profile, role change, suspend, reattribute, password reset
- **DELETE**: Never (soft delete via status)

---

## Table 2: `id_map`

> Bridges old IDs (RespyrD01, profile257) to new IDs (EvanG, etc.). Read-only for most flows.

| Screen | Platform | Route / File | Role | Operation | What happens |
|--------|----------|-------------|------|-----------|-------------|
| **Login (legacy fallback)** | Web/App | `dietician_login.php` | All | **READ** | If user found in `app_users`, also look up `id_map` to get legacy ID for backward-compat cookie. |
| **Trainer → Client Profile** | Web | `/trainer/client` (test data, diet plans) | Trainer | **READ** | New user_id → `id_map` → legacy `dietician_id` → query `table_test_data`, `table_diet_plan_strategy`, etc. |
| **Trainer → Dashboard cards** | Web | `/trainer/dashboard` | Trainer | **READ** | New user_id → `id_map` → legacy ID → `test_statistic_by_dietitian.php`. |
| **Client → Test Results** | App (Flutter) | `result_screen.dart`, `test_history_screen.dart` | Client | **READ** | New user_id → `id_map` → `profile_id` → `table_test_data`. |
| **Client → Diet Plan** | App (Flutter) | `diet_plan_screen.dart` | Client | **READ** | New user_id → `id_map` → `profile_id` → `table_diet_plan_strategy`. |
| **Client → Food Log** | App (Flutter) | `log_food_pages.dart` | Client | **READ** | New user_id → `id_map` → `profile_id` → `table_food_log`. |
| **Client → Chat** | App (Flutter) | `chat_screen.dart` | Client | **READ** | New user_id → `id_map` → `profile_id` → `table_chat_threads`. |
| **Migration seeding** | Backend | One-time script | System | **INSERT** | Seed existing 11 dieticians + all clients. Run once with Chandan. |

**Summary: id_map**
- **INSERT**: One-time seeding (Monday session)
- **READ**: Every API that crosses new→old boundary
- **UPDATE**: Only `migrated` flag when an old table column is fully migrated
- **DELETE**: Never

---

## Table 3: `referral_codes`

> Each trainer/TA/client gets a unique referral code to share.

| Screen | Platform | Route / File | Role | Operation | What happens |
|--------|----------|-------------|------|-----------|-------------|
| **Trainer → Referrals page** | Web | `/trainer/earnings/referrals` | Trainer | **READ** | Fetch my referral code(s): `WHERE owner_user_id = me.user_id`. Display code + share link. |
| **Trainer → Referrals page** | Web | `/trainer/earnings/referrals` | Trainer | **INSERT** | Auto-generate referral code on first visit if none exists. Format TBD (Q9 for Chandan). |
| **Trainer Admin → Overview** | Web | `/trainer-admin/overview` | Trainer Admin | **READ** | Show own referral code + usage stats (times_used). |
| **Super Admin → Overview** | Web | `/super-admin/overview` | Super Admin | **READ** | Aggregate referral stats across network. |
| **Client → Invite Friend** | App (Flutter) | `subscription_screen.dart` (future) | Client | **READ** | Display my referral code for sharing. |
| **Client → Invite Friend** | App (Flutter) | (future screen) | Client | **INSERT** | Auto-generate code on first share attempt. |
| **Anyone → Apply code** | App/Web | Signup / activation flow | Public | **UPDATE** | Increment `times_used`. Check `is_active` and `max_uses`. |

**Summary: referral_codes**
- **INSERT**: Auto-generated per user on first access
- **READ**: Referrals page (web), share flow (app)
- **UPDATE**: `times_used` incremented on each use; `is_active` toggled by admin
- **DELETE**: Never (deactivate via is_active = 0)

---

## Table 4: `referral_transactions`

> Tracks every signup/subscription that came through a referral code.

| Screen | Platform | Route / File | Role | Operation | What happens |
|--------|----------|-------------|------|-----------|-------------|
| **Signup with referral** | App/Web | Signup flow / activation code screen | Public | **INSERT** | When new user signs up with a referral code: record referrer, referee, event_type. Status = 'pending'. |
| **Subscription purchase** | App (Flutter) | `activation_code_screen.dart` | Client | **UPDATE** | When referee subscribes: update `event_type = 'subscription'`, link `subscription_id`. |
| **Trainer → Referrals page** | Web | `/trainer/earnings/referrals` | Trainer | **READ** | List of people who used my code. Show: referee name, date, status (pending/credited). |
| **Trainer Admin → Overview** | Web | `/trainer-admin/overview` | Trainer Admin | **READ** | Aggregate: how many referrals across my trainers. |
| **Super Admin → Overview** | Web | `/super-admin/overview` | Super Admin | **READ** | Network-wide referral stats. |
| **Backend cron / webhook** | Backend | Subscription confirmed | System | **UPDATE** | Move status from 'pending' → 'credited' when credit event fires (Q8 for Chandan). |

**Summary: referral_transactions**
- **INSERT**: On signup with referral code
- **READ**: Referrals page (web), admin dashboards
- **UPDATE**: Status transitions (pending → credited / expired / cancelled)
- **DELETE**: Never

---

## Table 5: `referral_rewards`

> What the referrer earns from successful referrals.

| Screen | Platform | Route / File | Role | Operation | What happens |
|--------|----------|-------------|------|-----------|-------------|
| **Backend trigger** | Backend | After transaction status → 'credited' | System | **INSERT** | Create reward record: type (subscription_extension / discount / free_tests / cashback), value, unit. Status = 'pending'. |
| **Trainer → Earnings Overview** | Web | `/trainer/earnings/overview` | Trainer | **READ** | Show pending + applied rewards. "You earned 30 days free from 3 referrals." |
| **Trainer → Referrals page** | Web | `/trainer/earnings/referrals` | Trainer | **READ** | Per-referral reward breakdown: who, what reward, status. |
| **Trainer Admin → Earnings** | Web | `/trainer-admin/earnings/overview` | Trainer Admin | **READ** | Aggregate reward stats for own network. |
| **Super Admin → Payouts** | Web | `/super-admin/payouts` | Super Admin | **READ** | View all pending/applied rewards across network. |
| **Client → Subscription** | App (Flutter) | `subscription_screen.dart` | Client | **READ** | Show any rewards earned from referring friends. |
| **Backend cron** | Backend | Auto-apply or expire | System | **UPDATE** | Apply reward (set `applied_at`, status → 'applied') or expire (status → 'expired'). |

**Summary: referral_rewards**
- **INSERT**: System-generated when referral transaction is credited
- **READ**: Earnings pages (web), subscription screen (app)
- **UPDATE**: Status transitions (pending → applied / expired)
- **DELETE**: Never

---

## Table 6: `audit_log`

> Every privileged action logged. Required by user lifecycle rules.

| Screen | Platform | Route / File | Role | Operation | What happens |
|--------|----------|-------------|------|-----------|-------------|
| **Edit Role** | Web | `EditRoleDialog.jsx` | Super Admin | **INSERT** | Log: actor (user_id, role, name), target (user_id, role, name), action = 'change_role', from_value = old role, to_value = new role, reason. |
| **Suspend / Reinstate** | Web | `SuspensionDialog.jsx` | Super Admin | **INSERT** | Log: action = 'suspend' or 'reinstate', reason, actor, target. |
| **Reattribute Client** | Web | `ReattributeDialog.jsx` | Super Admin | **INSERT** | Log: action = 'reattribute', from_value = old trainer user_id, to_value = new trainer user_id, reason. |
| **Invite Trainer** | Web | `/trainer-admin/trainers` | Trainer Admin | **INSERT** | Log: action = 'invite_trainer', target = invited email, actor = TA. |
| **Create Referral Code** | Web/App | Referrals page / share flow | Trainer/Client | **INSERT** | Log: action = 'create_referral_code', details = { code }. |
| **Password Change** | Web/App | Settings / updatepassword | All | **INSERT** | Log: action = 'password_change', actor = self. |
| **Account Deactivation** | App (Flutter) | `account_delete_screen.dart` | Client | **INSERT** | Log: action = 'deactivate_account', reason, actor = self. |
| **Super Admin → Audit Logs** | Web | `/super-admin/audit-logs` | Super Admin | **READ** | Full audit trail. Filter by action, actor, target, date range. Searchable. |

**Summary: audit_log**
- **INSERT**: Every privileged action (role change, suspend, reattribute, invite, referral, password, deactivation)
- **READ**: Super Admin audit logs page only
- **UPDATE**: Never (append-only)
- **DELETE**: Never (compliance requirement)

---

## Quick Reference: Who touches what

| Table | Super Admin (Web) | Trainer Admin (Web) | Trainer (Web) | Client (App) | Backend/System |
|-------|:-:|:-:|:-:|:-:|:-:|
| `app_users` | R, U | R, U (own + invite) | R, U (own) | R, U (own), I (onboard) | R (login) |
| `id_map` | — | — | R (bridge) | R (bridge) | I (seed), R |
| `referral_codes` | R | R | R, I | R, I | U (times_used) |
| `referral_transactions` | R | R | R | — | I, U (status) |
| `referral_rewards` | R | R | R | R | I, U (status) |
| `audit_log` | R | — | — | — | I (all actions) |

**Legend:** I = Insert, R = Read, U = Update, — = No access

---

## What Chandan needs to build (API-side)

### New APIs (read/write new tables only):
1. `POST /api/auth/login` — Query `app_users` first, fallback `table_dietician`
2. `POST /api/users/invite` — Insert `app_users` + `audit_log`
3. `GET /api/users/:id` — Read `app_users`
4. `PUT /api/users/:id/role` — Update `app_users.role` + `audit_log`
5. `PUT /api/users/:id/status` — Update `app_users.status` + `audit_log`
6. `PUT /api/users/:id/reattribute` — Update `app_users.parent_user_id` + `audit_log`
7. `POST /api/referral/generate` — Insert `referral_codes`
8. `POST /api/referral/apply` — Insert `referral_transactions` + Update `referral_codes.times_used`
9. `GET /api/referral/my-stats` — Read `referral_codes` + `referral_transactions` + `referral_rewards`
10. `GET /api/audit-logs` — Read `audit_log` (super_admin only)

### Old APIs (untouched, use legacy tables):
- All test data endpoints (`get_score_trend1.php`, `get_latest_test_by_date.php`, etc.)
- All diet plan endpoints (`insert_diet_plan_strategy.php`, `fetch_diet_json.php`, etc.)
- All food log endpoints (`save_weekly_food_json.php`, etc.)
- All chat endpoints
- All notification endpoints

### Bridge APIs (new tables + id_map JOIN to old tables):
- `GET /api/trainer/:id/test-stats` — `app_users` → `id_map` → `table_test_data`
- `GET /api/client/:id/diet-plan` — `app_users` → `id_map` → `table_diet_plan_strategy`
- Built gradually as Chandan migrates each old API
