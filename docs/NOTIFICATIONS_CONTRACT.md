# Real-time Notifications — Socket.IO Contract

**Status: implemented on both sides.** The backend serves this contract
from `src/services/socketService.ts` (transport + handshake auth) and
`src/services/notificationService.ts` (persistence + emit). Notifications
are stored in the `notifications` table; see migration
`20260822000000_add_notifications`.

## Connection

Frontend connects to `REACT_APP_SOCKET_URL` (falls back to the REST API
host if that env var isn't set) and sends the access token like this:

```js
io(SOCKET_URL, { auth: { token: accessToken } })
```

**Backend does**: reads `socket.handshake.auth.token` in an `io.use()`
middleware, verifies it with the same secret and rules as the REST API
(refresh tokens are rejected), and refuses the connection otherwise.
Each socket joins only its own `user:<id>` room, so a notification can
never reach another vendor.

## Events the backend should emit

### `notification:backlog` — once, right after a successful connection
Send the admin's unread notifications (e.g. last 20, or all unread —
your call). Frontend replaces its local list with whatever this sends.

```json
[
  {
    "id": "uuid",
    "type": "new_booking",
    "title": "New booking received",
    "message": "Rajesh Pushpakar booked \"Shadi\" for Jun 25, 2026",
    "entityId": "booking-uuid",
    "isRead": false,
    "createdAt": "2026-07-29T10:12:00.000Z"
  }
]
```

### `notification:new` — every time a new event happens
Same single-object shape as one item above. Emit this whenever something
notification-worthy happens server-side — the obvious first ones:

- `new_booking` — a booking is created
- `booking_updated` — booking status changes
- `payment_received` — a payment/advance is recorded
- `booking_cancelled` — a booking is cancelled

`type` is a free string on the frontend (`new_booking` |
`booking_updated` | `payment_received` | `booking_cancelled` | `generic`)
— add more as needed, the frontend doesn't hard-branch on it beyond
display, so new types are safe to add without a frontend change.

## Events the frontend listens for (recap)
- `connect` / `disconnect` — standard Socket.IO lifecycle
- `notification:backlog` — array, see above
- `notification:new` — single object, see above

## Read-state (implemented)
Read-state persists. The frontend updates optimistically and then calls:
- `GET /api/notifications` — recent notifications for the caller
- `PATCH /api/notifications/:id/read`
- `PATCH /api/notifications/read-all`

All three require a bearer token and are scoped to the caller, so one
admin cannot mark another's notifications read by guessing an id. The
socket also accepts `notification:read` and `notification:read-all`.

---

Frontend files: `src/services/socket/socketService.ts`,
`src/hooks/useNotificationSocket.ts`,
`src/store/notification/NotificationSlice.ts`.
