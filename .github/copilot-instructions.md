# FoodRescue Application - Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
FoodRescue is a comprehensive web application designed to connect food donors with recipients within a 5km radius using an interactive map. The platform facilitates food donation, ensures food safety through admin verification, and promotes social impact through transparency and community engagement.

## Tech Stack
- **Frontend**: Next.js 14 with TypeScript and App Router
- **Styling**: Tailwind CSS with custom design system
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based auth with role-based access control
- **Maps**: React Leaflet for interactive mapping
- **Icons**: Lucide React for consistent iconography
- **Notifications**: React Toastify for user feedback

## Architecture & Patterns
- Use Next.js App Router for routing and API routes
- Implement role-based access control (Donor, Recipient, Admin)
- Follow RESTful API design principles
- Use TypeScript interfaces for type safety
- Implement proper error handling and validation
- Use custom hooks for reusable logic
- Follow component composition patterns

## User Roles & Permissions
1. **Donors**: Can post food donations, manage listings, view pickup confirmations
2. **Recipients**: Can browse and reserve food donations, view pickup details
3. **Admins**: Can verify donations, manage users, access analytics dashboard

## Key Features to Implement
- User authentication and profile management
- Interactive map with 5km radius filtering
- Food donation posting and management
- Real-time notifications and messaging
- Admin verification system
- Rating and review system
- Analytics and impact tracking
- Search and filtering capabilities

## Database Models
- **User**: Store user profiles, roles, locations, preferences
- **FoodDonation**: Track food items, status, location, verification
- **Notification**: Handle real-time alerts and messages
- **Review**: Manage ratings and feedback
- **Report**: Handle inappropriate content reporting

## Styling Guidelines
- Use the custom color palette defined in tailwind.config.js
- Implement responsive design with mobile-first approach
- Use consistent spacing and typography
- Follow the established component patterns
- Ensure accessibility with proper ARIA labels
- Use semantic HTML elements

## Code Quality Standards
- Write self-documenting code with clear variable names
- Add TypeScript types for all props and data structures
- Implement proper error boundaries and loading states
- Use proper MongoDB indexes for performance
- Validate all inputs on both client and server side
- Follow the established folder structure

## Security Considerations
- Validate and sanitize all user inputs
- Implement proper authentication middleware
- Use environment variables for sensitive data
- Implement rate limiting for API endpoints
- Ensure proper data validation in Mongoose schemas
- Handle file uploads securely

## Performance Optimization
- Implement proper image optimization with Next.js Image component
- Use server-side rendering where appropriate
- Implement pagination for large data sets
- Optimize database queries with proper indexing
- Use caching strategies for frequently accessed data
- Implement lazy loading for map components

## Testing Strategy
- Write unit tests for utility functions
- Implement integration tests for API routes
- Test user flows with role-based scenarios
- Ensure cross-browser compatibility
- Test responsive design on various devices

When writing code:
1. Always consider the user role and permissions
2. Implement proper error handling and loading states
3. Follow the established patterns and conventions
4. Write clean, maintainable TypeScript code
5. Consider the real-world use cases of food rescue operations
6. Ensure the UI is intuitive and accessible for all users
