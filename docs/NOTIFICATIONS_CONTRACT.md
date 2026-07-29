# Real-time Notifications — Socket.IO Contract

Frontend uses `socket.io-client` and is already wired up (connects on
login, disconnects on logout). It's waiting on the backend to run a
Socket.IO server implementing the events below.

## Connection

Frontend connects to `REACT_APP_SOCKET_URL` (falls back to the REST API
host if that env var isn't set) and sends the access token like this:

```js
io(SOCKET_URL, { auth: { token: accessToken } })
```

**Backend needs to**: read `socket.handshake.auth.token`, verify it the
same way the REST API verifies the `Authorization` bearer token, and
reject the connection (or emit an `auth_error`) if it's invalid/expired.
Please scope notifications to the authenticated admin/org — don't
broadcast to everyone connected.

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

## Not yet implemented (frontend currently only reflects local state)
"Mark as read" only updates the frontend's local Redux state right now —
it does **not** call the backend. If you want read-state to persist
across page reloads / devices, we'll need:
- `PATCH /notifications/:id/read`
- `PATCH /notifications/read-all`

Let me know if you want these added now or later — the frontend is easy
to wire up once these exist.

---

Frontend files: `src/services/socket/socketService.ts`,
`src/hooks/useNotificationSocket.ts`,
`src/store/notification/NotificationSlice.ts`.
