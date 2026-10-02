# PostgreSQL setup

The schema targets PostgreSQL 14 or newer. Create a database and apply the migration with:

```sh
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f database/schema.sql
```

Set `DATABASE_URL`, `ADMIN_PHONE`, `ADMIN_PASSWORD`, and a high-entropy `SESSION_SECRET` in the cloud environment. Set `VITE_WHATSAPP_NUMBER` before building the frontend; the default support destination is `9647740080310`.

The schema includes an atomic `consume_coupon` function. Production order creation must call it in the same database transaction as order creation; checking the coupon in browser storage is not a security boundary.

The application API stores new orders in PostgreSQL and exposes them to authenticated administrators. Students' profiles, points, attendance, coupons, coordinator settings, and their personal order list still use browser storage. An order submitted to the database includes the displayed browser quote, but that quote is not yet recalculated against server-owned pricing and must not be used to charge a card.

Wayl checkout and webhook verification are deliberately disabled until Wayl's official API documentation and merchant configuration are available. When implementing them, calculate and persist the final discounted amount on the server, create checkout only from that persisted amount, keep merchant secrets server-side, and mark an order paid only after verifying Wayl's signed server-to-server payment notification. Never mark an order paid based only on a browser response or a user-provided reference.

Production startup requires `DATABASE_URL`. Apply `database/schema.sql` before launching the server and set strong `ADMIN_PHONE`, `ADMIN_PASSWORD`, and `SESSION_SECRET` values. Keep the database private and restrict its network access to the application host.