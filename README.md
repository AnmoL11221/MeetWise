# MeetWise

**MeetWise** - Transform your meetings with AI-powered insights and real-time collaboration.

## 🚀 Features

### Core Meeting Management
- **Smart Meeting Creation**: Create meetings with detailed descriptions, scheduling, and access controls
- **Real-time Collaboration**: Live collaborative meeting rooms with agenda management
- **Action Item Tracking**: Track and manage action items with priorities and status updates
- **User Management**: Invite and manage meeting participants with role-based access

### AI-Powered Intelligence
- **AI Briefing Dossier**: Get comprehensive pre-meeting intelligence including attendee profiles, relevant documents, and market insights
- **AI Sparring Partner**: Practice your presentations with realistic AI personas and get delivery feedback

### Advanced Features
- **Meeting Settings**: Configure privacy, access controls, and scheduling
- **Shared Resources**: Collaborate on documents, links, and files
- **Upcoming Meetings**: Dashboard view of your scheduled meetings
- **Clerk Authentication**: Secure user authentication and management

## 🎯 AI Sparring Partner - Revolutionary Practice Feature

The AI Sparring Partner is a groundbreaking feature that transforms how you prepare for important meetings. It's like having a personal coach who helps you practice and refine your presentation skills in a safe, realistic environment.

### 🎭 Persona Simulation
The AI can role-play as different types of meeting attendees, each with their own personality, expertise, and communication style:

- **CFO Persona**: Asks tough questions about ROI, budget implications, and financial risks
- **Engineering Lead**: Focuses on technical feasibility, implementation details, and system integration
- **Product Manager**: Questions user impact, market fit, and success metrics
- **Sales Director**: Inquires about competitive advantage, customer positioning, and revenue impact

### 🔍 Follow-up Question Drills
Based on your talking points and responses, the AI generates the most likely follow-up questions you'll receive, allowing you to:
- Practice your answers in advance
- Refine your arguments and evidence
- Identify potential weak points in your presentation
- Build confidence through repetition

### 🎤 Delivery Feedback
Optional microphone integration provides real-time feedback on your presentation delivery:

- **Pacing Analysis**: Evaluates your speaking speed and rhythm
- **Clarity Assessment**: Analyzes sentence structure and communication clarity
- **Filler Word Detection**: Identifies and counts filler words (um, uh, like, etc.)
- **Confidence Indicators**: Assesses your assertiveness and conviction
- **Overall Performance Score**: Provides a comprehensive delivery rating

### 🎯 How It Works

1. **Setup Your Practice Session**
   - Select your role (Presenter, Facilitator, SME, etc.)
   - Choose your scenario (Pitch, Status Update, Problem Discussion, etc.)
   - The AI analyzes your meeting agenda and selects relevant personas

2. **Practice with AI Personas**
   - Engage in realistic conversations with AI personas
   - Each persona responds based on their role and expertise
   - Practice handling tough questions and objections

3. **Get Instant Feedback**
   - Record your responses for delivery analysis
   - Receive detailed feedback on pacing, clarity, and confidence
   - Get actionable recommendations for improvement

4. **Generate Follow-up Questions**
   - Request AI-generated follow-up questions based on your responses
   - Practice handling the most likely objections and inquiries
   - Refine your messaging and evidence

### 🎨 User Interface

The AI Sparring Partner features a modern, intuitive interface:

- **Setup Panel**: Configure your practice session with role and scenario selection
- **Persona Cards**: Visual representation of AI personas with their expertise and communication style
- **Chat Interface**: Real-time conversation with AI personas
- **Recording Controls**: Easy audio recording and transcript editing
- **Feedback Dashboard**: Comprehensive delivery analysis with scores and recommendations
- **Session Stats**: Track your practice progress and engagement

### 🔧 Technical Implementation

- **Backend**: NestJS with Prisma ORM for data management
- **AI Logic**: Sophisticated persona simulation and response generation
- **Audio Processing**: Real-time audio analysis for delivery feedback
- **Real-time Communication**: WebSocket-based chat interface
- **Database**: PostgreSQL with optimized schema for practice sessions

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/AnmoL11221/MeetWise
cd MeetWise
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Environment Setup
Create `.env` files in both `apps/api` and `apps/web` directories:

**apps/api/.env:**
```env
DATABASE_URL="postgresql://postgres:password@localhost:5433/meetwise"
CLERK_SECRET_KEY="your_clerk_secret_key"
CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
```

**apps/web/.env:**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY="your_liveblocks_public_key"
LIVEBLOCKS_SECRET_KEY="your_liveblocks_secret_key"
```

### 4. Database Setup
```bash
# Start the database
docker-compose up -d

# Run migrations
cd apps/api
npx prisma migrate dev
npx prisma generate
```

### 5. Start the Application
```bash
# Start the API server
cd apps/api
npm run start:dev

# Start the web application (in a new terminal)
cd apps/web
npm run dev
```

## 🎯 Usage

### Getting Started with AI Sparring Partner

1. **Create a Meeting**: Set up a meeting with agenda items and attendees
2. **Access Practice Mode**: Click on the "AI Sparring Partner" section in your meeting
3. **Configure Session**: Select your role and scenario
4. **Start Practicing**: Begin your conversation with AI personas
5. **Record and Analyze**: Use the recording feature to get delivery feedback
6. **Improve**: Review feedback and practice again

### Best Practices

- **Practice Regularly**: Use the AI Sparring Partner before important meetings
- **Try Different Scenarios**: Practice various meeting types and roles
- **Review Feedback**: Pay attention to pacing, clarity, and confidence scores
- **Refine Responses**: Use follow-up questions to strengthen your arguments
- **Record Multiple Sessions**: Track your improvement over time

## 🏗️ Architecture

### Backend (NestJS)
- **Modules**: Meetings, Action Items, AI Sparring Partner, Briefing Dossier
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk integration
- **Real-time**: WebSocket support for live collaboration

### Frontend (Next.js)
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom components
- **State Management**: React hooks and context
- **Real-time**: Liveblocks integration for collaborative features

### AI Features
- **Persona Simulation**: Context-aware AI responses based on role and expertise
- **Delivery Analysis**: Audio processing and speech analysis
- **Question Generation**: AI-powered follow-up question generation
- **Feedback System**: Comprehensive presentation feedback and recommendations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Clerk** for authentication
- **Liveblocks** for real-time collaboration
- **Prisma** for database management
- **Tailwind CSS** for styling
- **Lucide React** for icons

---

**MeetWise** - Where AI meets human collaboration to create better meetings.
