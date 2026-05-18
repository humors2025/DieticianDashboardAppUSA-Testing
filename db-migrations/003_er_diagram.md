# ER Diagram — v3 Schema (6 New Tables + Legacy Bridge)

> For Monday May 19 session with Chandan
> Shows all 6 new tables, their relationships, and how they bridge to legacy tables via `id_map`.

```mermaid
erDiagram
    %% ============================================================
    %% NEW TABLES (6)
    %% ============================================================

    app_users {
        int id PK "AUTO_INCREMENT"
        varchar user_id UK "e.g. IshanS, EvanG"
        enum role "super_admin | trainer_admin | trainer | client"
        varchar partner_code "Public-facing code"
        varchar parent_user_id FK "FK → app_users.user_id"
        enum status "active | suspended | inactive"
        datetime created_at
        datetime updated_at
    }

    id_map {
        int id PK "AUTO_INCREMENT"
        enum legacy_table "table_dietician | table_clients"
        varchar legacy_id "e.g. RespyrD01, profile257"
        varchar new_user_id FK "FK → app_users.user_id"
        tinyint migrated "0 or 1"
        datetime created_at
    }

    referral_codes {
        int id PK "AUTO_INCREMENT"
        varchar referral_code UK "Unique shareable code"
        enum owner_role "super_admin | trainer_admin | trainer | client"
        varchar owner_user_id FK "FK → app_users.user_id"
        tinyint is_active "1 = active"
        int max_uses "NULL = unlimited"
        int times_used "Incremented on use"
        datetime created_at
        datetime updated_at
    }

    referral_transactions {
        int id PK "AUTO_INCREMENT"
        int referral_code_id FK "FK → referral_codes.id"
        varchar referrer_user_id FK "FK → app_users.user_id"
        enum referrer_role "super_admin | trainer_admin | trainer | client"
        varchar referee_user_id FK "FK → app_users.user_id"
        enum referee_role "trainer_admin | trainer | client"
        enum event_type "signup | subscription | device_purchase"
        int subscription_id FK "FK → client_subscriptions.id"
        enum status "pending | credited | expired | cancelled"
        datetime created_at
        datetime updated_at
    }

    referral_rewards {
        int id PK "AUTO_INCREMENT"
        int transaction_id FK "FK → referral_transactions.id"
        varchar beneficiary_user_id FK "FK → app_users.user_id"
        enum beneficiary_role "super_admin | trainer_admin | trainer | client"
        enum reward_type "subscription_extension | discount | cashback | free_tests"
        varchar reward_value "e.g. 30, 20"
        enum reward_unit "days | percent | amount | count"
        enum status "pending | applied | expired"
        datetime applied_at
        datetime expires_at
        datetime created_at
    }

    audit_log {
        int id PK "AUTO_INCREMENT"
        varchar actor_user_id FK "FK → app_users.user_id"
        enum actor_role "super_admin | trainer_admin | trainer | client | system"
        varchar actor_name
        varchar action "e.g. change_role, suspend"
        varchar target_user_id FK "FK → app_users.user_id"
        enum target_role "super_admin | trainer_admin | trainer | client"
        varchar target_name
        varchar from_value "Previous value"
        varchar to_value "New value"
        text reason
        json details
        datetime created_at
    }

    %% ============================================================
    %% LEGACY TABLES (not altered — shown for context)
    %% ============================================================

    table_dietician {
        varchar dietician_id PK "e.g. RespyrD01"
        varchar name
        varchar email
        varchar password "bcrypt"
        varchar phone_no
        tinyint is_reset_password
    }

    table_clients {
        varchar profile_id PK "e.g. profile257"
        varchar dietician_id FK "FK → table_dietician"
        varchar name
        varchar email
        varchar phone_no
        varchar dob
        varchar gender
        float height
        float weight
    }

    client_subscriptions {
        int id PK
        varchar dietician_id FK
        varchar profile_id FK
        varchar plan_type
        datetime start_date
        datetime end_date
    }

    %% ============================================================
    %% RELATIONSHIPS
    %% ============================================================

    %% Hierarchy: SA → TA → Trainer → Client
    app_users ||--o{ app_users : "parent_user_id (hierarchy)"

    %% id_map bridges new ↔ legacy
    app_users ||--|| id_map : "user_id → new_user_id"
    id_map }o--|| table_dietician : "legacy_id → dietician_id"
    id_map }o--|| table_clients : "legacy_id → profile_id"

    %% Referral codes owned by users
    app_users ||--o{ referral_codes : "owner_user_id"

    %% Referral transactions
    referral_codes ||--o{ referral_transactions : "referral_code_id"
    app_users ||--o{ referral_transactions : "referrer_user_id"
    app_users ||--o{ referral_transactions : "referee_user_id"
    referral_transactions }o--o| client_subscriptions : "subscription_id"

    %% Referral rewards
    referral_transactions ||--o{ referral_rewards : "transaction_id"
    app_users ||--o{ referral_rewards : "beneficiary_user_id"

    %% Audit log
    app_users ||--o{ audit_log : "actor_user_id"
    app_users ||--o{ audit_log : "target_user_id"

    %% Legacy relationships (unchanged)
    table_dietician ||--o{ table_clients : "dietician_id"
    table_clients ||--o{ client_subscriptions : "profile_id"
```

---

## Hierarchy Chain (self-referencing `app_users.parent_user_id`)

```
Super Admin (IshanS)
  ├── Trainer Admin (EvanG?)
  │     ├── Trainer (MarcusH)
  │     │     ├── Client (profile257)
  │     │     └── Client (profile312)
  │     └── Trainer (SarahK)
  └── Trainer Admin (DerekL?)
        └── Trainer (KaiN)
```

## Bridge Pattern (login JOIN)

```sql
-- Login: email → table_dietician → id_map → app_users
SELECT au.role, au.parent_user_id, au.partner_code, au.status,
       d.name, d.email, d.phone_no, d.is_reset_password
FROM table_dietician d
JOIN id_map m ON m.legacy_id = d.dietician_id AND m.legacy_table = 'table_dietician'
JOIN app_users au ON au.user_id = m.new_user_id
WHERE d.email = ?
```

## Quick Reference

| New Table | Points to | Via |
|-----------|-----------|-----|
| `app_users` | itself | `parent_user_id → user_id` |
| `id_map` | `app_users` + legacy tables | `new_user_id` + `legacy_id` |
| `referral_codes` | `app_users` | `owner_user_id` |
| `referral_transactions` | `referral_codes` + `app_users` × 2 | `referral_code_id` + `referrer/referee_user_id` |
| `referral_rewards` | `referral_transactions` + `app_users` | `transaction_id` + `beneficiary_user_id` |
| `audit_log` | `app_users` × 2 | `actor_user_id` + `target_user_id` |
