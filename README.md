# Meeting Room Booking System

## Introduction
This is a meeting room booking system, which can be used by the company to book meeting rooms.

## System Architecture
Frontend: React, Ant Design
Backend: Nest.js, TypeORM, Swagger
Database: MySQL, Redis
DevOps: Docker, NGINX

## Features
### backend interface:
#### Interface document
1. The API document is on http://localhost:3000/api-doc, start server before access it.
2. use npm run repl to test the module and service, the history log is in .nestjs_repl_history.
```
npm run repl
await getBookingService().init-data()
```
#### backend AOP implementation:
1. use Interceptors to implements log, and customize response
2. use Guards to validate loin user and permission(RBAC)
3. use Pipes to validate request body
4. use Swagger to document api
5. use Filter to customize exception error
#### User management
1. Register and CAPTCHA
2. Login with password, access with JWT token
3. Update user info and password
4. User list and pagination, search and filter
5. freeze user
#### Meeting room management
1. list, search and filter, create, update and delete the meeting room
#### Booking management
1. user can get list, search and filter the booking.
2. user can book room, and urge the manager to confirm.
3. manager can confirm or cancel the booking.