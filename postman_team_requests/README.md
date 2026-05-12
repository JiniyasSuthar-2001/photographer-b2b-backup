# Postman Team Requests — Quick Reference

This directory contains structured test flows for team building and referral/subscription validation.

## Files

| File | Purpose |
|------|---------|
| `01_full_team_invitations.md` | Send team invites to all 9 photographers, accept invitations, verify roster |
| `02_referral_subscription_flow.md` | End-to-end referral reward flow — signup with code, first purchase, +15 day reward |

## Quick Start Order

1. **Sign up all users** → `postman_scenarios/00_Photographer_Auth.md`
2. **Build the team** → `01_full_team_invitations.md`
3. **Test referral reward** → `02_referral_subscription_flow.md`
4. **Run full job lifecycle** → `postman_scenarios/06_Job_and_Analytics_Reference.md`

## Key Endpoints

| Action | Method | URL |
|--------|--------|-----|
| Send team invite | POST | `/api/team/request` |
| Check pending invites | GET | `/api/team/requests/pending` |
| Accept/decline invite | PATCH | `/api/team/request/{id}?status=accepted` |
| View joined studios | GET | `/api/team/joined` |
| View team roster | GET | `/api/team/` |
| Get referral info | GET | `/api/referral/info` |
| Apply referral code | POST | `/api/referral/apply` |
| Purchase subscription | POST | `/api/subscription/purchase` |
| Check subscription | GET | `/api/subscription/status` |

## Important Notes

- `user_type` is always `"photographer"` for all users
- Subscription endpoint is `POST /api/subscription/purchase` (not `/upgrade`)
- Referral reward (+15 days) fires **only on first purchase**, never on subsequent ones
- WebSocket events are pushed automatically — no polling needed for reward confirmation
