# PRD: User Profile Management

## Introduction

Add a comprehensive user profile system that allows users to customize their account with avatars, bios, and social links. This feature will improve user engagement and personalization.

## Goals

- Allow users to upload profile avatars
- Enable users to add a bio/description
- Support social media link integration
- Provide profile visibility controls (public/private)
- Ensure all changes are persisted and immediately reflected in the UI

## User Stories

### US-001: Create user profiles table
**Description:** As a developer, I need a database table to store user profile information so that user data persists across sessions.

**Acceptance Criteria:**
- [ ] Create `user_profiles` table with columns: user_id (FK), bio (text, nullable), avatar_url (string, nullable), is_public (boolean, default true), created_at, updated_at
- [ ] Add foreign key constraint to users table
- [ ] Add index on user_id for fast lookups
- [ ] Generate and run migration successfully
- [ ] Typecheck passes

### US-002: Create profile API endpoints
**Description:** As a developer, I need REST API endpoints to read and update user profiles so the frontend can interact with profile data.

**Acceptance Criteria:**
- [ ] GET /api/profile returns current user's profile data
- [ ] PUT /api/profile updates bio, avatar_url, and is_public fields
- [ ] POST /api/profile/avatar handles avatar image upload
- [ ] Input validation for all fields (bio max 500 chars, valid URL for avatar)
- [ ] Returns 404 if profile doesn't exist
- [ ] Tests pass for all endpoints
- [ ] Typecheck passes

### US-003: Build profile page UI
**Description:** As a user, I want a profile page where I can view and edit my information so I can personalize my account.

**Acceptance Criteria:**
- [ ] Create /profile route and ProfilePage component
- [ ] Display current avatar, bio, and visibility setting
- [ ] Edit mode with form fields for bio (textarea) and visibility (toggle)
- [ ] Save button with loading state
- [ ] Cancel button to discard changes
- [ ] Success/error toast notifications
- [ ] Tests pass
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-004: Add avatar upload functionality
**Description:** As a user, I want to upload a custom avatar image so my profile feels more personal.

**Acceptance Criteria:**
- [ ] Avatar upload component with drag-and-drop support
- [ ] File validation: only images, max 2MB
- [ ] Image preview before upload
- [ ] Upload progress indicator
- [ ] Crop/resize to 256x256 pixels
- [ ] Store in cloud storage (S3/Cloudinary)
- [ ] Update profile with new avatar_url after upload
- [ ] Tests pass
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-005: Add profile visibility controls
**Description:** As a user, I want to control whether my profile is public or private so I can manage my privacy.

**Acceptance Criteria:**
- [ ] Toggle switch for public/private visibility on profile page
- [ ] Private profiles hidden from public search and other users
- [ ] Public profiles accessible via /u/:username route
- [ ] Visibility setting persists after page refresh
- [ ] Tests pass
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

## Functional Requirements

- FR-1: Users can upload avatar images up to 2MB (JPEG, PNG, GIF)
- FR-2: Bio field supports up to 500 characters with markdown formatting
- FR-3: Profile data updates immediately without page reload
- FR-4: Avatar images are processed and stored at multiple sizes (64x64, 256x256)
- FR-5: Private profiles return 404 to unauthorized viewers

## Non-Goals (Out of Scope)

- Real-time profile updates via WebSocket
- Profile analytics or view counts
- Custom profile themes or colors
- Profile verification badges
- Social media feed integration
- Following/followers system

## Design Considerations

- Use existing Card and Form components from UI library
- Avatar display: circular crop with fallback to initials
- Mobile-responsive layout with stacked fields on small screens
- Loading skeletons while profile data fetches

## Technical Considerations

- Store avatars in S3 with CloudFront CDN
- Use sharp library for image processing
- Cache profile data in Redis for 5 minutes
- Rate limit: 5 avatar uploads per hour per user
- Database: Add user_profiles table via migration

## Success Metrics

- 80% of active users complete their profile within 7 days
- Avatar upload success rate > 95%
- Profile page load time < 200ms (cached)
- Zero data loss during profile updates

## Open Questions

- Should we support Gravatar as fallback for users without custom avatars?
- Do we need profile completion progress indicator?
- Should we send email notifications when profile is updated?
