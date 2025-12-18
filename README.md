<div align="center">

# 🛡️ Cyberguard API

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Security](https://img.shields.io/badge/security-hardened-red.svg)

**A security-hardened, gamified cybersecurity awareness platform**

[Features](#key-features) • [Tech Stack](#technology-stack) • [Architecture](#architecture-principles) • [License](#license)

</div>

---

## Overview

Cyberguard is a comprehensive cybersecurity education platform designed to teach authenticated users about cybersecurity concepts and safe digital behavior through an engaging, gamified learning experience. Built with Node.js, Express, and MongoDB, this backend API powers an interactive learning journey.

---

## What This Application Does

<table>
<tr>
<td width="50%">

### Authentication & Authorization
Secure user registration and login with email/password and Google OAuth integration

### Learning Management
15 comprehensive cybersecurity modules across three difficulty levels:
-  **Beginner**
-  **Intermediate** 
-  **Advanced**

### Progress Tracking
Monitors user learning progress, quiz attempts, and completion status in real-time

</td>
<td width="50%">

### Gamification System
- Points for correct answers
- Achievement badges
- Live leaderboards

### AI-Powered Features
- Content enhancement and explanation generation
- Adaptive feedback for quiz responses
- Guidance chatbot (blocked during active quizzes)

### Admin Controls
Module and badge management, user administration, and comprehensive audit logging

### Security Features
Rate limiting, input sanitization, audit trails, and multi-layered security controls

</td>
</tr>
</table>

---

## How Users Interact

### Regular Users

```
┌─────────────────┐
│ Register/Login  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Choose Module   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│Complete Content │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Take Quiz     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Earn Rewards   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Track Progress  │
└─────────────────┘
```

**User Journey:**

1. **Registration & Login** — Create an account with email/password or sign in with Google
2. **Choose Learning Path** — Select modules from Beginner, Intermediate, or Advanced levels
3. **Complete Modules** — Read educational content and take quizzes to test knowledge
4. **Earn Rewards** — Accumulate points, unlock badges, and climb the leaderboard
5. **Track Progress** — View statistics, earned badges, and completed modules
6. **Get Assistance** — Use the AI chatbot for platform guidance (disabled during active quizzes)

### Administrators

<table>
<thead>
<tr>
<th width="30%">Function</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>User Management</strong></td>
<td>Suspend or activate user accounts</td>
</tr>
<tr>
<td><strong>Content Management</strong></td>
<td>Create, update, or delete learning modules and badges</td>
</tr>
<tr>
<td><strong>Monitoring</strong></td>
<td>Review audit logs, security events, and platform statistics</td>
</tr>
<tr>
<td><strong>Oversight</strong></td>
<td>Ensure platform integrity and moderate content</td>
</tr>
</tbody>
</table>

---

## Key Features

### Security-First Design

<table>
<tr>
<td width="33%">

**Input Protection**
- Zero-trust architecture
- Strict input validation
- NoSQL injection prevention

</td>
<td width="33%">

**Attack Prevention**
- XSS protection
- CSRF protection
- Rate limiting

</td>
<td width="33%">

**Audit & Sessions**
- Comprehensive logging
- Secure cookies
- Session-based auth

</td>
</tr>
</table>

### Learning System

<table>
<thead>
<tr>
<th width="20%">Level</th>
<th>Topics Covered</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Beginner</strong></td>
<td>Digital hygiene • Password security • Phishing awareness • Social engineering • Safe browsing</td>
</tr>
<tr>
<td><strong>Intermediate</strong></td>
<td>Malware types • Network security • Encryption basics • Secure communications • Incident response</td>
</tr>
<tr>
<td><strong>Advanced</strong></td>
<td>Threat modeling • Risk assessment • Security frameworks • Compliance standards • Advanced cryptography</td>
</tr>
</tbody>
</table>

### Gamification

<div align="center">

```
Points System → Badge Achievements → Leaderboard Rankings → Performance Analytics
```

</div>

<table>
<tr>
<td width="25%" align="center"><strong>Points</strong><br/>Awarded for correct answers</td>
<td width="25%" align="center"><strong>Badges</strong><br/>Milestones and achievements</td>
<td width="25%" align="center"><strong>Leaderboard</strong><br/>Real-time rankings</td>
<td width="25%" align="center"><strong>Statistics</strong><br/>Performance tracking</td>
</tr>
</table>

### AI Integration

<table>
<tr>
<td width="50%">

**Capabilities**
- Google Gemini for content generation
- Adaptive feedback system
- Server-side validation

</td>
<td width="50%">

**Safeguards**
- Strict scope limitations (cybersecurity only)
- Sanitization of all inputs
- Chatbot blocked during active learning

</td>
</tr>
</table>

---

## Architecture Principles

<table>
<thead>
<tr>
<th width="30%">Principle</th>
<th>Implementation</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Single Source of Truth</strong></td>
<td>All business logic, validation, and authorization occurs server-side</td>
</tr>
<tr>
<td><strong>Zero Client Trust</strong></td>
<td>No assumptions about client behavior or data</td>
</tr>
<tr>
<td><strong>Immutable Core Data</strong></td>
<td>Base learning content cannot be modified by users or AI</td>
</tr>
<tr>
<td><strong>Defense in Depth</strong></td>
<td>Multiple security layers protect against various attack vectors</td>
</tr>
<tr>
<td><strong>Audit Everything</strong></td>
<td>All significant actions are logged for security review</td>
</tr>
</tbody>
</table>

---

## Technology Stack

<div align="center">

<table>
<thead>
<tr>
<th width="30%">Category</th>
<th>Technologies</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Runtime</strong></td>
<td><img src="https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white" alt="Node.js"/></td>
</tr>
<tr>
<td><strong>Framework</strong></td>
<td><img src="https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white" alt="Express"/></td>
</tr>
<tr>
<td><strong>Database</strong></td>
<td><img src="https://img.shields.io/badge/MongoDB_Atlas-47A248?style=flat&logo=mongodb&logoColor=white" alt="MongoDB"/></td>
</tr>
<tr>
<td><strong>Authentication</strong></td>
<td><img src="https://img.shields.io/badge/Passport.js-34E27A?style=flat&logo=passport&logoColor=white" alt="Passport"/> (Local & Google OAuth)</td>
</tr>
<tr>
<td><strong>AI</strong></td>
<td><img src="https://img.shields.io/badge/Google_Gemini-4285F4?style=flat&logo=google&logoColor=white" alt="Google Gemini"/></td>
</tr>
<tr>
<td><strong>Security</strong></td>
<td>Helmet • express-rate-limit • express-mongo-sanitize • xss-clean</td>
</tr>
<tr>
<td><strong>Validation</strong></td>
<td>express-validator • Joi</td>
</tr>
</tbody>
</table>

</div>

---

## License

```
MIT License - Feel free to use this project for educational purposes
```

<div align="center">

**Built with care for cybersecurity education**

---

⭐ Star this repo if you find it helpful!

</div>
