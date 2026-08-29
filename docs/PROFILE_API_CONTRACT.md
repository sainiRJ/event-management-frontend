# Account Settings — Backend API Contract

Frontend is already wired up and waiting on these 4 endpoints. All requests
go through the same authenticated axios instance as the rest of the app
(bearer token in the `Authorization` header — same as `/booking/all` etc.),
and every response should use the **same `{ error, data }` envelope** the
rest of the API already uses (see the `/status/all` example below for
reference — this is the shape the frontend expects everywhere).

## 1. Get current profile

```
GET /user/me/profile
```

**Response 200**
```json
{
  "error": null,
  "data": {
    "id": "uuid",
    "name": "Admin",
    "email": "admin@sainievents.com",
    "phoneNumber": "9876543210",
    "photoUrl": "https://.../photo.jpg",
    "role": "admin",
    "createdAt": "2026-05-16T08:13:55.000Z"
  }
}
```
`phoneNumber`, `photoUrl`, `role`, `createdAt` are optional — the frontend
handles them being null/absent.

## 2. Update profile (name / email)

```
PATCH /user/me/profile
Content-Type: application/json
```

**Request body**
```json
{ "name": "New Name", "email": "new@email.com" }
```

**Response 200** — same shape as GET above, with updated values.

**Response on validation error** (e.g. email already taken) — use a
non-200 status and:
```json
{
  "error": {
    "message": { "error": { "message": "Email is already in use" } }
  },
  "data": null
}
```
(The frontend reads `response.payload.message.error.message` for the
toast text — see the `error` field the way `/status/all`'s error path is
already structured elsewhere in this API.)

## 3. Upload profile photo

```
POST /user/me/photo
Content-Type: multipart/form-data
```

**Request**: form field named `photo`, single image file (frontend already
caps it at 5MB client-side, but please also validate size/type server-side).

**Response 200** — full profile object (same shape as #1) with the new
`photoUrl` populated.

## 4. Change password

```
PATCH /user/me/password
Content-Type: application/json
```

**Request body**
```json
{ "currentPassword": "old-pass", "newPassword": "new-pass" }
```

**Response 200**
```json
{ "error": null, "data": null }
```

**Response on wrong current password** — non-200 status with:
```json
{
  "error": { "message": { "error": { "message": "Current password is incorrect" } } },
  "data": null
}
```

---

Frontend files if you want to see exactly how these are called:
`src/services/api/eventManagementServer/UserService.ts`,
`src/store/user/ThunkActions.ts`.
