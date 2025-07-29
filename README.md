# MeetWise - AI-Powered Meeting Management Platform

MeetWise is a comprehensive meeting management platform that combines real-time collaboration, AI-powered insights, and intelligent meeting preparation tools. Built with Next.js, NestJS, and PostgreSQL, it provides a modern, feature-rich solution for teams to manage meetings effectively.

## 🚀 Features

### Core Meeting Management
- **Meeting Creation & Scheduling**: Create meetings with detailed descriptions, scheduling, and privacy controls
- **Access Control**: Three levels of meeting access - INVITE_ONLY, PUBLIC, and RESTRICTED
- **Real-time Collaboration**: Live agenda management and action item tracking
- **User Management**: Secure authentication with Clerk and attendee invitation system

### AI Briefing Dossier
- **Attendee Profiles**: LinkedIn integration with recent activity and company information
- **Relevant Documents**: AI-powered analysis of past meeting notes and shared resources
- **Market Intelligence**: Real-time news about companies and competitors
- **Agenda Analysis**: Smart topic complexity assessment and time estimation
- **AI Insights**: Automated meeting preparation recommendations and key insights

### Shared Resources
- **Document Management**: Upload and organize meeting-related documents
- **Link Sharing**: Share external resources and references
- **Collaborative Scratchpad**: Real-time brainstorming and note-taking
- **Resource Types**: Support for documents, links, files, and collaborative scratchpads

### Action Item Tracking
- **Kanban Board**: Visual task management with drag-and-drop functionality
- **Priority Levels**: LOW, MEDIUM, HIGH priority classification
- **Assignee Management**: Assign tasks to meeting attendees
- **Status Tracking**: TODO, IN_PROGRESS, DONE status workflow
- **Due Date Management**: Set and track task deadlines

### Real-time Collaboration
- **Liveblocks Integration**: Real-time agenda and action item updates
- **Multi-user Editing**: Simultaneous collaboration on meeting materials
- **Presence Indicators**: See who's currently active in the meeting
- **Conflict Resolution**: Automatic conflict resolution for concurrent edits

## 🛠 Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Clerk**: Authentication and user management
- **Liveblocks**: Real-time collaboration
- **Lucide React**: Icon library

### Backend
- **NestJS**: Node.js framework for scalable server-side applications
- **Prisma**: Database ORM with type safety
- **PostgreSQL**: Primary database
- **Clerk**: Authentication integration
- **Swagger**: API documentation

### Infrastructure
- **Docker**: Containerization for development
- **pnpm**: Fast, disk space efficient package manager
- **ESLint**: Code linting and formatting

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- pnpm
- Docker and Docker Compose
- Git

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd MeetWise
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Environment Setup
Create environment files for both API and web applications:

**API Environment** (`apps/api/.env`):
```env
DATABASE_URL="postgresql://username:password@localhost:5432/meetwise"
CLERK_SECRET_KEY="your_clerk_secret_key"
CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
```

**Web Environment** (`apps/web/.env.local`):
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY="your_liveblocks_public_key"
LIVEBLOCKS_SECRET_KEY="your_liveblocks_secret_key"
```

### 4. Start Database
```bash
docker compose up -d
```

### 5. Run Database Migrations
```bash
cd apps/api
npx prisma migrate dev
```

### 6. Start Development Servers
```bash
# Start API server
cd apps/api
pnpm run start:dev

# Start web application (in new terminal)
cd apps/web
pnpm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000

## 📁 Project Structure

```
MeetWise/
├── apps/
│   ├── api/                    # NestJS backend
│   │   ├── src/
│   │   │   ├── action-items/   # Action item management
│   │   │   ├── briefing-dossier/ # AI briefing features
│   │   │   ├── clerk/          # Authentication integration
│   │   │   ├── guards/         # Route protection
│   │   │   ├── meetings/       # Meeting management
│   │   │   └── prisma/         # Database configuration
│   │   └── prisma/
│   │       └── schema.prisma   # Database schema
│   └── web/                    # Next.js frontend
│       ├── src/
│       │   ├── app/            # App Router pages
│       │   ├── components/     # React components
│       │   └── middleware.ts   # Clerk middleware
│       └── liveblocks.config.ts
├── docker-compose.yml          # Database container
└── package.json               # Workspace configuration
```

## 🔧 API Endpoints

### Meetings
- `GET /meetings` - Get user's meetings
- `POST /meetings` - Create new meeting
- `GET /meetings/:id` - Get meeting details
- `PATCH /meetings/:id` - Update meeting
- `DELETE /meetings/:id` - Delete meeting
- `POST /meetings/:id/invite` - Invite user to meeting
- `GET /meetings/upcoming` - Get upcoming meetings

### Action Items
- `GET /action-items/meeting/:meetingId` - Get meeting action items
- `POST /action-items` - Create action item
- `PATCH /action-items/:id` - Update action item
- `DELETE /action-items/:id` - Delete action item

### AI Briefing Dossier
- `GET /briefing-dossier/:meetingId` - Get briefing dossier
- `POST /briefing-dossier/:meetingId/generate` - Generate new dossier

### Shared Resources
- `GET /meetings/:meetingId/resources` - Get meeting resources
- `POST /meetings/:meetingId/resources` - Add resource
- `PATCH /meetings/:meetingId/resources/:id` - Update resource
- `DELETE /meetings/:meetingId/resources/:id` - Delete resource

## 🎯 Usage Guide

### Creating a Meeting
1. Navigate to the dashboard
2. Click "Create Meeting"
3. Fill in meeting details (title, description, scheduled time)
4. Set privacy and access controls
5. Add agenda items
6. Invite attendees

### Using AI Briefing Dossier
1. Open a meeting
2. Navigate to the AI Briefing Dossier section
3. Click "Generate Dossier" to create comprehensive briefing
4. Explore different tabs:
   - **Overview**: Key insights and recommendations
   - **Attendees**: LinkedIn profiles and company information
   - **Documents**: Relevant past meeting notes
   - **Market News**: Company and competitor updates
   - **Agenda Analysis**: Topic complexity and time estimates

### Managing Action Items
1. In a meeting, go to the Action Items section
2. Create new tasks with priority levels
3. Assign tasks to attendees
4. Track progress with drag-and-drop Kanban board
5. Update status and due dates

### Sharing Resources
1. In a meeting, access the Shared Resources section
2. Add documents, links, or create scratchpads
3. Collaborate in real-time on shared materials
4. Organize resources by type and relevance

## 🔒 Security Features

- **Authentication**: Secure user authentication with Clerk
- **Authorization**: Role-based access control for meetings
- **Data Protection**: Encrypted data transmission
- **Privacy Controls**: Meeting-level privacy settings
- **Input Validation**: Comprehensive input sanitization

## 🚀 Deployment

### Production Build
```bash
# Build API
cd apps/api
pnpm run build

# Build Web
cd apps/web
pnpm run build
```

### Environment Variables
Ensure all production environment variables are properly configured:
- Database connection strings
- Clerk API keys
- Liveblocks credentials
- CORS settings

### Database Migration
```bash
cd apps/api
npx prisma migrate deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🔮 Roadmap

- [ ] File upload functionality
- [ ] Meeting templates
- [ ] Advanced analytics
- [ ] Mobile application
- [ ] Calendar integration
- [ ] Video conferencing integration
- [ ] Advanced AI features
- [ ] Multi-language support

---

**MeetWise** - Transform your meetings with AI-powered insights and real-time collaboration.