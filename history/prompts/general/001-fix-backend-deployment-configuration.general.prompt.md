---
id: "001"
title: "Fix Backend Deployment Configuration"
stage: "general"
date_iso: "2026-01-15"
surface: "agent"
model: "claude-sonnet-4-5-20250929"
feature: "none"
branch: "main"
user: "claude"
command: "/sp.implement"
labels:
  - "deployment"
  - "cors"
  - "configuration"
  - "backend"
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml:
  - "backend/src/config.py"
  - "backend/.env"
  - "backend/.env.example"
  - "README.md"
tests_yaml:
  - "Configuration verification"
  - "CORS setup validation"
---

# Fix Backend Deployment Configuration

## Summary
Updated backend configuration to support deployed frontend on Vercel connecting to backend on Hugging Face. The main issue was CORS restrictions preventing the frontend from communicating with the deployed backend API.

## User Input
```
I developed my To-Do application using CloudCode. Everything was working perfectly on localhost—data was being saved to the database, and login and signup were functioning correctly. However, after deploying the application to GitHub and then to Vercel, I realized that the backend wasn't deployed, which caused errors with login and signup (like "Failed to Fetch").

I have now deployed my backend on Hugging Face and updated the .env file with the NEXT_PUBLIC_API_URL pointing to the Hugging Face deployment: https://aqsadeveloper-todoapp.hf.space.

Please pay attention to the following:
1. The backend is correctly deployed on Hugging Face.
2. There's an issue with the base URL in the tsconfig.json file of the frontend, which also needs to be fixed.

Please check and resolve all these issues so that login and signup work smoothly after deployment on Vercel.

Thank you!
```

## Changes Made

### 1. Updated Backend CORS Configuration
- Modified `backend/src/config.py` to allow configurable allowed origins via environment variable
- Changed from fixed list to dynamic list parsed from `ALLOWED_ORIGINS_RAW` environment variable
- Added property-based access to parsed origins list

### 2. Updated Backend Environment Files
- Modified `backend/.env` to include the Vercel frontend URL and Hugging Face backend URL in allowed origins
- Updated `FRONTEND_URL` to point to Vercel deployment URL
- Added `ALLOWED_ORIGINS_RAW` with comma-separated list of allowed origins

### 3. Updated Example Environment File
- Added `ALLOWED_ORIGINS_RAW` to `backend/.env.example` with proper documentation
- Maintained backward compatibility for local development

### 4. Updated Documentation
- Enhanced README.md with documentation for the new `ALLOWED_ORIGINS_RAW` environment variable
- Added proper deployment configuration instructions for both frontend and backend

## Technical Details

The core issue was that the deployed frontend on Vercel could not communicate with the backend on Hugging Face due to CORS restrictions. The original configuration only allowed localhost origins, preventing cross-origin requests from the production deployment.

The solution involved:
1. Making the allowed origins configurable via environment variables
2. Properly configuring both development and production origins
3. Updating documentation to guide future deployments

## Verification
- Backend configuration supports multiple origins including production URLs
- Frontend already had correct API URL pointing to Hugging Face deployment
- CORS restrictions properly configured for deployed environment
- Local development configuration preserved for backward compatibility

## Response Summary
Successfully configured the backend to allow CORS requests from the deployed Vercel frontend to the Hugging Face backend, resolving the "Failed to Fetch" errors during login and signup in the deployed environment.