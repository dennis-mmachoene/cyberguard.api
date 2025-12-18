# Cyberguard API

## Overview

Cyberguard is a security-hardened, gamified cybersecurity awareness platform designed to educate authenticated users on cybersecurity concepts and safe digital behavior. This repository contains the backend API built with Node.js, Express, and MongoDB.

## What This Application Does

The Cyberguard API provides:

- **Authentication & Authorization**: Secure user registration and login with email/password and Google OAuth
- **Learning Management**: 15 comprehensive cybersecurity modules across three difficulty levels (Beginner, Intermediate, Advanced)
- **Progress Tracking**: Monitors user learning progress, quiz attempts, and completion status
- **Gamification**: Points, badges, and leaderboard system to motivate and engage learners
- **AI-Powered Features**: 
  - Content enhancement and explanation generation
  - Adaptive feedback for quiz responses
  - Guidance chatbot (blocked during active quizzes to maintain integrity)
- **Admin Controls**: Module and badge management, user administration, and audit logging
- **Security Features**: Rate limiting, input sanitization, audit trails, and comprehensive security controls

## How Users Interact

### Regular Users

1. **Registration & Login**: Create an account with email/password or sign in with Google
2. **Choose Learning Path**: Select modules from Beginner, Intermediate, or Advanced levels
3. **Complete Modules**: Read educational content and take quizzes to test knowledge
4. **Earn Rewards**: Accumulate points, unlock badges, and climb the leaderboard
5. **Track Progress**: View statistics, earned badges, and completed modules
6. **Get Assistance**: Use the AI chatbot for platform guidance (disabled during active quizzes)

### Administrators

1. **User Management**: Suspend or activate user accounts
2. **Content Management**: Create, update, or delete learning modules and badges
3. **Monitoring**: Review audit logs, security events, and platform statistics
4. **Oversight**: Ensure platform integrity and moderate content

## Key Features

### Security-First Design
- Zero-trust architecture with strict input validation
- NoSQL injection prevention
- XSS and CSRF protection
- Rate limiting on all sensitive endpoints
- Comprehensive audit logging
- Session-based authentication with secure cookies

### Learning System
- **Beginner Level**: Digital hygiene, password security, phishing awareness, social engineering, safe browsing
- **Intermediate Level**: Malware types, network security, encryption basics, secure communications, incident response
- **Advanced Level**: Threat modeling, risk assessment, security frameworks, compliance standards, advanced cryptography

### Gamification
- Points awarded for correct answers
- Badges for milestones and achievements
- Real-time leaderboard with rankings
- Performance tracking and statistics

### AI Integration
- Google Gemini for content generation
- Strict scope limitations (cybersecurity education only)
- Server-side validation and sanitization
- Chatbot blocked during active learning to prevent cheating

## Architecture Principles

This backend follows strict architectural constraints:

- **Single Source of Truth**: All business logic, validation, and authorization occurs server-side
- **Zero Client Trust**: No assumptions about client behavior or data
- **Immutable Core Data**: Base learning content cannot be modified by users or AI
- **Defense in Depth**: Multiple security layers protect against various attack vectors
- **Audit Everything**: All significant actions are logged for security review

## Technology Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **Authentication**: Passport.js (Local & Google OAuth)
- **AI**: Google Gemini
- **Security**: Helmet, express-rate-limit, express-mongo-sanitize, xss-clean
- **Validation**: express-validator, Joi

## License

MIT