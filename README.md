<p align="center">
  <img 
    src="public/images/Renoa_logo.png" 
    width="140" 
    alt="Renoa Logo"
  />
</p>

<p align="center">
  A Secure Social Blogging & Real-Time Communication Platform
</p>




<p align="center">
  <img src="https://img.shields.io/badge/Status-Production%20Ready-success" />
  <img src="https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-informational" />
  <img src="https://img.shields.io/badge/Database-MongoDB-brightgreen" />
  <img src="https://img.shields.io/badge/Auth-JWT%20%7C%20OTP-blue" />
  <img src="https://img.shields.io/badge/Security-End--to--End%20Encryption-critical" />
</p>

<p align="center">
  <a href="https://renoa.app"><strong>Live Demo</strong></a> ·
  <a href="#features-overview">Features</a> ·
  <a href="#deployment">Deployment</a> ·
  <a href="#run-locally">Run Locally</a>
</p>


---
## TL;DR

Renoa is a production-ready social blogging platform featuring:
- Secure OTP + JWT authentication
- Real-time blogs, comments, and messaging
- Device-based end-to-end encrypted private chats
- AWS + Cloudflare production deployment


## Table of Contents

- [About](#about)
- [Live Demo](#live-demo)
- [Features Overview](#features-overview)
  - [Authentication & Security](#authentication--security)
  - [Access Control Model](#access-control-model)
  - [Blogging System](#blogging-system)
  - [Real-Time Comments](#real-time-comments)
  - [User Profiles](#user-profiles)
  - [Encrypted Private Messaging](#encrypted-private-messaging)
- [Deployment](#deployment)
- [Security Highlights](#security-highlights)
- [Tech Stack](#tech-stack)
- [System Design](#system-design)
  - [Request Flow & Infrastructure Design](#request-flow--infrastructure-design)
  - [Encrypted Messaging Design](#encrypted-messaging-design)
  - [Authentication Flow](#authentication-flow-system-level)
  - [Route Overview](#route-overview)
- [Infrastructure Responsibilities](#infrastructure-responsibilities)
- [Architectural Rationale](#architectural-rationale)
- [Scaling Considerations](#scaling-considerations-future)
- [Environment Setup](#environment-setup)
- [Run Locally](#run-locally)
- [Known Limitations](#known-limitations)
- [Design Philosophy](#design-philosophy)

## About

**Renoa** is a full-stack social blogging and networking platform focused on **security, ownership, and real-time interaction**.  
Users can publish blogs, interact through real-time comments, follow creators, and communicate privately using **device-based end-to-end encrypted messaging**.

The platform enforces strict authentication and authorization rules while maintaining a clean and intuitive user experience.

---

##  Live Demo

**Renoa App:** https://renoa.app

---

## Features Overview

## Authentication & Security

> Designed with a security-first approach

- User registration with **email verification via OTP**
- OTPs are **bcrypt-hashed** and time-bound
- Passwords hashed using a salted, cryptographically secure hashing strategy
- JWT-based authentication for protected routes
- Mandatory re-verification on email change
- Secure password recovery using OTP verification

---

## Access Control Model

### ✔ Authenticated Users
- Create, edit, and delete blogs
- Upload blog cover images
- Write content using **Markdown**
- Comment on blogs (real time)
- Edit profile information
- Follow users
- Send and receive encrypted messages
- WebSocket connections are authenticated using JWT


### 👀 Public Visitors
- View blogs
- Read comments

**Restricted for public users:**
- No commenting
- No profile access
- No following
- No private messaging

---

## Blogging System

- Rich blog editor with:
  - Title
  - Cover image
  - Markdown-supported content
- Strict blog ownership enforcement
- Editable and deletable only by the author
- Clean rendering for improved readability

---

## Real-Time Comments

- Live comment updates without page refresh
- All users viewing a blog receive updates instantly

---

## User Profiles

- Displays user information, authored blogs, and comments
- Profile owners can update personal details and share their profile links
- Other users can:
  - Follow / unfollow
  - Initiate private messaging

---

## Encrypted Private Messaging

> Device-based end-to-end encryption

- Private keys are generated **only when visiting `/messages`**
- Each device creates a **unique private key per user**
- Keys are securely stored using **IndexedDB**
- Messages can be sent to users who have opened `/messages`

### Device Behavior

- Messages are readable **only on the originating device**
- Logging in from a new device:
  - Generates a new private key
  - Makes previous encrypted messages inaccessible
  - Starts a fresh encrypted session
- Multiple user accounts supported on a single device

---

## Messaging Capabilities

- Real-time messaging
- Message sent & seen status
- Online / offline presence
- Last seen tracking
- Client-side decryption for privacy

---

## Deployment

- Deployed on **AWS Elastic Beanstalk**
- Runs on a **single EC2 instance**
- Application is exposed using the instance **public IP address**
- **Cloudflare** is used for:
  - DNS management for `renoa.app`
  - SSL/TLS certificate provisioning
- Domain is linked to the EC2 instance IP via Cloudflare DNS
- HTTPS is enforced through Cloudflare’s SSL layer

---

## Security Highlights

- OTP-based email ownership verification
- Hashed OTP storage (bcrypt)
- Passwords hashed using a salted, cryptographically secure hashing strategy
- JWT-protected routes
- Client-side encryption
- Device-based key isolation
- Strict authorization checks

---

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB
- JWT
- bcrypt

### Frontend
- EJS
- Bootstrap
- Markdown parser
- IndexedDB

### Real-Time
- WebSockets

---

## System Design

Renoa follows a **monolithic full-stack architecture** with clearly separated concerns for authentication, content management, real-time communication, and encrypted messaging.

---

### Application Architecture (High-Level)

```text
Client (Browser)
   │
   │  HTTP / WebSocket
   ▼
Node.js + Express Server
   │
   ├── Authentication & Authorization
   ├── Blog & Comment Management
   ├── Profile & Follow System
   ├── Real-Time Messaging (WebSockets)
   └── Encryption & Key Management
   │
   ▼
MongoDB (Primary Data Store)
```

---
## Request Flow & Infrastructure Design

Renoa uses a production-oriented request flow that separates **DNS, SSL, and application hosting** to improve security and manageability.

### High-Level Request Flow

```text
Client (Browser)
   │
   │  HTTPS Request
   ▼
renoa.app (Domain)
   │
   │  DNS Resolution
   ▼
Cloudflare
   │
   ├── SSL / TLS Termination
   ├── DNS Management
   └── Secure Traffic Forwarding
   │
   ▼
AWS Elastic Beanstalk
   │
   └── EC2 Instance (Node.js + Express)
           │
           ├── API & Page Rendering
           ├── Authentication & Authorization
           ├── Real-Time Messaging
           └── Encryption Logic
           │
           ▼
        MongoDB (Primary Database)
```
---
## Encrypted Messaging Design

Private messaging in Renoa uses **device-based end-to-end encryption** to ensure that only intended recipients can read messages.

### Encryption Workflow

```text
/messages route visited
        │
        ├── Device-specific private key generated
        ├── Private key stored in IndexedDB
        └── Public key shared with server


Sending Message
        │
        ├── Sender private key
        ├── Receiver public key
        └── Shared encryption key generated
             │
             ▼
        Encrypted message stored in database


Receiving / Decrypting Message
        │
        ├── Encrypted message fetched from database
        ├── Receiver private key (from IndexedDB)
        ├── Sender public key
        └── Shared decryption key derived
             │
             ▼
        Ciphertext decrypted on client


```
### Key Properties

- Private keys never leave the client
- Messages can't be sent if the receiver has never opened `/messages`
- Messages are readable only on the originating device
- Logging in on a new device:
  - Generates a new private key
  - Previously encrypted messages become inaccessible
  - Messaging starts fresh

----

### Authentication Flow (System Level)
```
User Signup
   │
   ├── Register (name, email, password)
   ├── Password hashed (Password hashed with per-user salt)
   ├── OTP generated & bcrypt-hashed
   └── Email verification required
        │
        ▼
Verified Account → Login Allowed
        │
        ├── JWT issued
        └── Protected routes unlocked
```
---

### Route Overview

Below is a code-accurate overview of the major application routes used in Renoa.

### Authentication & User Routes (`/user`)

| Route | Method | Description |
|------|--------|-------------|
| `/user/signup` | GET | Render signup page |
| `/user/signup` | POST | Register new user |
| `/user/signin` | GET | Render signin page |
| `/user/signin` | POST | Login user |
| `/user/logout` | GET | Logout user and clear session |
| `/user/verify` | GET | Render email/OTP verification page |
| `/user/verify` | POST | Verify OTP for signup or password reset |
| `/user/resend-otp` | POST | Resend OTP to email |
| `/user/forgot-password` | GET | Render forgot password page |
| `/user/forgot-password` | POST | Initiate password reset |
| `/user/reset-password` | GET | Render reset password page |
| `/user/reset-password` | POST | Reset password after OTP verification |

---

### Profile Routes (`/user/profile`)

| Route | Method | Description |
|------|--------|-------------|
| `/user/profile/:id` | GET | View user profile |
| `/user/profile/edit` | GET | Render profile edit page |
| `/user/profile/edit/image` | POST | Update profile image |
| `/user/profile/edit/name` | POST | Update profile name |
| `/user/profile/edit/email` | POST | Update email (requires re-verification) |

---

### Blog Routes (`/blog`)

| Route | Method | Description |
|------|--------|-------------|
| `/blog/add-new` | GET | Render add blog page |
| `/blog` | POST | Create new blog |
| `/blog/:id` | GET | View blog details |
| `/blog/:id/edit` | GET | Render edit blog page |
| `/blog/:id/edit` | POST | Update existing blog |
| `/blog/:id` | DELETE | Delete blog |
| `/` | GET | Public blog feed (homepage) |

---

### Comment Routes (`/blog`)

| Route | Method | Description |
|------|--------|-------------|
| `/blog/comment/:blogId` | POST | Add comment to a blog (real time) |

---

### Follow System (API) (`/api`)

| Route | Method | Description |
|------|--------|-------------|
| `/api/users/:id/toggle-follow` | POST | Follow or unfollow a user |
| `/api/users/:id/followers` | GET | Get followers of a user |
| `/api/users/:id/following` | GET | Get users a user is following |
| `/api/test` | GET | Auth test endpoint |

---

### Messaging Routes (`/messages`)

| Route | Method | Description |
|------|--------|-------------|
| `/messages` | GET | Render messaging page |
| `/messages/conversations` | GET | Fetch user conversations |
| `/messages/room/:roomId` | GET | Render individual chat view |
| `/messages/:roomId` | GET | Fetch messages for a conversation |
| `/messages/clear-unread` | POST | Clear unread message count |
| `/messages/search` | GET | Search users to start messaging |

---

### Device & Encryption Routes (`/api/devices`)

| Route | Method | Description |
|------|--------|-------------|
| `/api/devices/register` | POST | Register device public key |
| `/api/devices/public/:userId` | GET | Fetch latest public key of a user |

---

### WebSocket Events (Internal)

| Event | Purpose |
|------|--------|
| `new-comment` | Real-time blog comments |
| `user-updated` | Broadcast profile updates |
| `message` | Real-time encrypted chat |
| `presence` | Online / offline tracking |

---

### Route Mounting Summary

```text
/                → Homepage
/user            → Authentication & Profile
/blog            → Blogs & Comments
/messages        → Private Messaging
/api             → Follow system
/api/devices     → Device & Encryption
```
## Infrastructure Responsibilities

### Client (Browser)
- Initiates HTTPS requests
- Performs client-side encryption and decryption
- Stores device-specific private keys using **IndexedDB**

---

### Cloudflare
- Manages DNS for `renoa.app`
- Provides **SSL/TLS certificates**
- Enforces HTTPS across the application
- Acts as a secure entry point before AWS

---

### AWS Elastic Beanstalk
- Hosts the Node.js application
- Manages the underlying EC2 instance
- Handles application process management
- Exposes the application via a public IP

---

### EC2 Instance
- Runs the Express server
- Handles:
  - Authentication & JWT validation
  - Blog and comment APIs
  - WebSocket connections
  - Encrypted messaging logic

---

### MongoDB
- Primary data store for:
  - Users
  - Blogs
  - Comments
  - Encrypted messages
    
### IndexedDB (Client-Side Secure Storage)

- Used to store **device-scoped private encryption keys**
- Private keys are generated per user **per device**
- Keys never leave the client and are never transmitted to the server
- IndexedDB allows persistent, origin-scoped storage across browser sessions
- Enables strict **device-level message isolation** for end-to-end encryption

### JWT Session Management

- JWTs are issued upon successful authentication
- Tokens are used to authorize:
  - Protected HTTP routes
  - WebSocket connections
- JWTs are verified on every request and socket handshake
- Sessions are stateless, reducing server-side session storage overhead
- Token expiration and re-authentication are enforced for security

---

## Architectural Rationale

- **Cloudflare** simplifies DNS and SSL management
- **Elastic Beanstalk** reduces operational overhead
- A **single EC2 instance** is sufficient for the current scale
- Clear separation between network security and application logic
- Architecture is easy to extend and scale

---

## Scaling Considerations (Future)

- Introduce a load balancer in front of EC2 instances
- Scale horizontally with multiple EC2 instances
- Add **Redis** for caching and real-time optimizations
- Move media storage to **AWS S3**

## Environment Setup

```env
PORT=8000

MONGO_URL=your_mongodb_connection_string

EMAIL_USER=your_email_address
EMAIL_PASS=your_email_app_password

SESSION_SECRET=your_session_secret
JWT_SECRET=your_jwt_secret

```

## Environment Variable Description

| Variable         | Description                              |
|------------------|------------------------------------------|
| `PORT`           | Port on which the server runs             |
| `MONGO_URL`      | MongoDB connection string                |
| `EMAIL_USER`     | Email address used to send OTPs           |
| `EMAIL_PASS`     | App-specific email password              |
| `SESSION_SECRET` | Secret used for session handling          |
| `JWT_SECRET`     | Secret key for JWT signing                |


## Run Locally
```
git clone https://github.com/yourusername/renoa.git
cd renoa
npm install
npm start
```
## Known Limitations

- Encrypted messages are device-bound by design
- No multi-device message sync (intentional trade-off)
- Single-instance deployment (current scale)

## Design Philosophy

- Security over convenience
- Clear ownership boundaries
- Real-time UX without complexity
- Device-level privacy
- Production-focused architecture

