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




## About

**Renoa** is a full-stack social blogging and networking platform focused on **security, ownership, and real-time interaction**.  
Users can publish blogs, interact through real-time comments, follow creators, and communicate privately using **device-based end-to-end encrypted messaging**.

The platform enforces strict authentication and authorization rules while maintaining a clean and intuitive user experience.

---

## 🌐 Live Demo

**Renoa App:** https://renoa.app

---

## Features Overview

## Authentication & Security

> Designed with a security-first approach

- User registration with **email verification via OTP**
- OTPs are **bcrypt-hashed** and time-bound
- Passwords stored using **SHA-256 with salting**
- JWT-based authentication for protected routes
- Mandatory re-verification on email change
- Secure password recovery using OTP verification

---

## 👥 Access Control Model

### ✔ Authenticated Users
- Create, edit, and delete blogs
- Upload blog cover images
- Write content using **Markdown**
- Comment on blogs (real time)
- Edit profile information
- Follow users
- Send and receive encrypted messages

### 👀 Public Visitors
- View blogs
- Read comments

**Restricted for public users:**
- No commenting
- No profile access
- No following
- No private messaging

---

## 📝 Blogging System

- Rich blog editor with:
  - Title
  - Cover image
  - Markdown-supported content
- Strict blog ownership enforcement
- Editable and deletable only by the author
- Clean rendering for improved readability

---

## ⚡ Real-Time Comments

- Live comment updates without page refresh
- All users viewing a blog receive updates instantly

---

## 👤 User Profiles

- Displays user information and authored blogs
- Profile owners can update personal details
- Other users can:
  - Follow / unfollow
  - Initiate private messaging

---

## 🔒 Encrypted Private Messaging

> Device-based end-to-end encryption

- Private keys are generated **only when visiting `/messages`**
- Each device creates a **unique private key per user**
- Keys are securely stored using **IndexedDB**
- Messages can be sent to users who have never opened `/messages`

### Device Behavior

- Messages are readable **only on the originating device**
- Logging in from a new device:
  - Generates a new private key
  - Makes previous encrypted messages inaccessible
  - Starts a fresh encrypted session
- Multiple user accounts supported on a single device

---

## 💬 Messaging Capabilities

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

## 🛡️ Security Highlights

- OTP-based email ownership verification
- Hashed OTP storage (bcrypt)
- Salted password hashing (SHA-256)
- JWT-protected routes
- Client-side encryption
- Device-based key isolation
- Strict authorization checks

---

## 🛠️ Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB
- JWT
- bcrypt
- SHA-256

### Frontend
- EJS
- Bootstrap
- Markdown parser
- IndexedDB

### Real-Time
- WebSockets

---

## ⚙️ Environment Setup

```env
PORT=8000

MONGO_URL=your_mongodb_connection_string

EMAIL_USER=your_email_address
EMAIL_PASS=your_email_app_password

SESSION_SECRET=your_session_secret
JWT_SECRET=your_jwt_secret

```

## 🔐 Environment Variable Description

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

## 🎯 Design Philosophy

- Security over convenience
- Clear ownership boundaries
- Real-time UX without complexity
- Device-level privacy
- Production-focused architecture

