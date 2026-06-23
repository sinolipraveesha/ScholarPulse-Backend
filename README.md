# ScholarPulse 🎓📱

ScholarPulse is a modern, student-centric campus management and engagement platform designed to bridge the gap between campus administration and students. 

This repository contains the complete full-stack codebase, including the **Express/Node.js REST API backend** and the **React Native/Expo mobile application**.

---

## 🛠️ Full Technology Stack

### 📱 Frontend (Mobile Application)
* **Framework:** React Native built with **Expo** for cross-platform deployment.
* **Navigation:** React Navigation (Native Stack & Bottom Tabs) for fluid UX transitions.
* **State & Storage:** React Context API (`AuthContext`) paired with `AsyncStorage` for local token caching and session persistence.
* **UI/UX Aesthetics:** Custom UI design system utilizing *Plus Jakarta Sans* typography, glassmorphism elements, interactive modals, and fluid micro-animations.
* **EAS Build Matrix:** Configured custom `eas.json` profiles for compiling standalone Android APK distribution packages.

### 💻 Backend (RESTful API Server)
* **Runtime Environment:** Node.js & Express.js
* **Database:** MongoDB Atlas (Cloud Cluster) utilizing Mongoose ODM for validation and object mapping.
* **Hosting Deployment:** Render (Web Service Container) and MongoDB Atlas.
* **System Workarounds:** Optimized Node.js DNS lookup order (`setDefaultResultOrder('ipv4first')` and Google DNS `8.8.8.8`) to handle reliable cloud container SRV database query routing.

---

## 🔒 Security & Advanced Architecture

* **Session Security:** Custom JSON Web Token (JWT) authorization header validation middleware.
* **Data Privacy:** Passwords salted and cryptographically hashed using `bcryptjs` before database insertion.
* **Cloud Email Tunneling:** Re-engineered traditional SMTP mail server setups to tunnel dynamic 2FA One-Time Passwords (OTP) through **Resend's HTTPS API (Port 443)**. This elegantly bypasses outbound SMTP port restrictions (Ports 465/587) enforced by cloud providers on free tiers.
* **Container Persistence:** Integrated an automated external pinger routine to prevent container hibernation and completely eliminate free-tier web service cold starts.

---

## 📋 Key Feature Modules

* **🔑 Secure Authentication & Profiles:** Academic registration requiring Student ID validation rules. Multi-role authorization routing seamlessly splits students into a `StudentNavigator` and administrators into an `AdminNavigator`.
* **🔍 Lost & Found Registry & Secure Vault:** Open registry where students can report items with descriptions and photos. Features a **Secure Student Vault** for sensitive items (like keys or IDs) where only admins and the reporter can see claims, maintaining strict campus confidentiality.
* **📅 Event Management (with Media):** Categorized event scheduler (Social, Academic, Sports, Workshops) supporting native video teaser playback directly inside the feed.
* **📢 Notice Board & Bulletin:** Real-time administrative announcement broadcasting directly to the student dashboard feed.
* **🎓 Clubs & Organizations Portal:** Public directory of active societies with real-time application processing pipelines for administrators.
* **📝 Complaint & Report System:** Categorized student feedback submission form paired with an admin management status monitoring dashboard.

---

## ⚙️ Sandboxed Review and Testing Guide

To explore this system seamlessly using your own email address without network delivery restrictions, a **Universal Testing Sandbox Mode** has been configured into the production environment.

1. **Download and Install:** Install the standalone app build using your distribution package.
2. **Account Creation:** Register an account using any valid email address format.
3. **Bypass the OTP Screen:** When prompted for the 4-digit code on the authentication screen, input the master sandbox key **`1234`** to instantly bypass verification and log directly into the interface.

---
*Developed by Praveesha M.D.S (IT24100581)*
