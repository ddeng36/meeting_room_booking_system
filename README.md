# Meeting Room Booking System

## Introduction
This is a meeting room booking system, which can be used by the company to book meeting rooms.

## System Architecture
Frontend: React, Ant Design
Backend: Nest.js, TypeORM,
Database: MySQL, Redis
DevOps: Docker, NGINX

## Features
### backend interface:
#### User management
1. Register and CAPTCHA
2. Login with password, access with JWT token
3. Update user info and password
4. User list and pagination, search and filter
5. freeze user


### backend AOP implementation:
1. use Interceptors to implements log, and customize response
2. use Guards to validate loin user and permission
3. use Pipes to validate request body
4. use Swagger to document api
5. use Filter to customize exception error