# The Pre-Work App - Advanced Field Operations Platform 📋

# The Pre-Work App - Checklist Management System

A comprehensive React-based checklist management system designed specifically for cleaning and maintenance pre-work processes.

🚀 **Live Demo**: [https://teampaintbrush.github.io/pre-work-app/](https://teampaintbrush.github.io/pre-work-app/)

> **📖 For detailed feature documentation, see [FEATURES.md](./FEATURES.md)**

## 🚀 Key Features Overview

### 📋 **Smart Checklist Management**
- Dynamic progress tracking with real-time updates
- Auto-save functionality with localStorage persistence
- Section-based organization with priority indicators
- Custom checklist creation and template management

### 📸 **Advanced Media Capture**
- **In-app photo/video capture** with native camera integration
- **Auto-timestamping and geo-tagging** for proof of location
- **Before/after comparisons** with interactive slider views
- **Smart file management** with compression and cloud sync

### ⚖️ **Compliance & Validation**
- **Automatic compliance checking** - prevents job completion without critical tasks
- **Real-time validation** with custom rules and audit trails
- **Overdue task detection** with visual indicators and alerts
- **Manager override capabilities** for authorized personnel

### 📊 **Enhanced Progress Tracking**
- **Multi-level progress visualization** (overall, section, item-level)
- **Performance analytics** with efficiency tracking
- **Time estimation** based on historical data
- **Live team progress** with real-time sync

### 📤 **Professional Reporting**
- **PDF generation** with branded, professional layouts
- **Email integration** for direct report sending
- **Secure sharing links** with time-limited access
- **Complete audit trails** for compliance documentation

### � **Team Collaboration**
- **Role-based access** (Manager, Worker, Client, Admin modes)
- **Smart checklist assignment** with skill/certification matching
- **Real-time team tracking** with optional GPS location
- **Communication hub** with in-app messaging

## 🏗️ Technical Architecture

### Tech Stack
- **Frontend**: React 18 + Next.js 14 (App Router)
- **Styling**: Tailwind CSS + Custom CSS Variables
- **TypeScript**: Full type safety and IntelliSense
- **State Management**: React Hooks + LocalStorage
- **Build Tool**: Next.js with SWC compiler
- **Deployment**: Localhost development server

### Project Structure
```
the-pre-work-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # Root layout with Header/Footer
│   │   ├── page.tsx          # Main application page
│   │   └── globals.css       # Global styles + Tailwind
│   ├── components/            # React components
│   │   ├── Checklist/        # Core checklist functionality
│   │   │   ├── ChecklistContainer.tsx    # Main container component
│   │   │   ├── ChecklistItem.tsx        # Individual task component
│   │   │   ├── ChecklistSection.tsx     # Section grouping
│   │   │   └── ProgressBar.tsx         # Progress visualization
│   │   ├── Layout/           # Layout components
│   │   │   ├── Header.tsx    # Navigation header
│   │   │   └── Footer.tsx    # Application footer
│   │   └── UI/              # Reusable UI components
│   │       ├── Button.tsx    # Styled button component
│   │       └── Modal.tsx     # Modal dialog component
│   ├── data/                 # Static data and templates
│   │   └── presetChecklists.ts  # Predefined checklist templates
│   └── types/               # TypeScript type definitions
│       └── index.ts         # Shared interfaces and types
├── public/                  # Static assets
│   ├── uploads/            # User uploaded images (when API created)
│   └── saved/             # Exported checklist data
├── package.json           # Dependencies and scripts
├── next.config.js        # Next.js configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── postcss.config.js     # PostCSS configuration
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern web browser

### Quick Start
```bash
# Navigate to project directory
cd "c:\Users\leroy\Downloads\WORDPRESS TO REACT PROJECT\The Pre-Work App - Checklist\the-pre-work-app\pre-work-app"

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript types
npm run test:aws     # Test AWS integration
```

### Developer Tools

The project includes AWS setup and testing scripts in the `scripts/` directory:

**AWS Setup:**
```powershell
# Set up all AWS resources (DynamoDB tables + S3 buckets)
.\scripts\aws\setup-aws-resources.ps1

# With custom parameters
.\scripts\aws\setup-aws-resources.ps1 -Environment "prod" -ProjectName "my-app"
```

**AWS Testing:**
```bash
# Test AWS integration (DynamoDB + S3 connectivity)
npm run test:aws

# Test individual components
node scripts/tests/test-credentials.js
node scripts/tests/test-dynamodb-permissions.js
```

**Documentation:**
- `scripts/aws/README.md` - AWS setup guide and IAM requirements
- `scripts/tests/README.md` - Testing guide and troubleshooting

## 📖 Usage Guide

### Getting Started
1. **Launch the Application**: Open http://localhost:3000 in your browser
2. **Review the Template**: The Cleaning Pre-Work template loads automatically
3. **Complete Tasks**: Click checkboxes to mark tasks as complete
4. **Add Details**: Expand tasks to add notes and upload photos
5. **Track Progress**: Monitor completion with the progress bars
6. **Export Data**: Use the Export JSON button to save your work

### Key Interactions
- **Toggle Sections**: Click section headers to expand/collapse
- **Complete Tasks**: Check boxes next to task titles
- **Add Notes**: Expand tasks and click "Add Notes" or "Edit Notes"
- **Upload Photos**: Use the upload button within expanded tasks
- **Scroll to Top**: Click the "↑ Top" button or any navigation link
- **Export Progress**: Use the "Export JSON" button for data backup

### Required vs Optional Tasks
- **Red Border**: Indicates required tasks that must be completed
- **Progress Tracking**: Separate tracking for required vs all tasks
- **Completion Status**: Visual indicators for different completion states

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#2563eb) - Main actions and links
- **Success**: Green (#10b981) - Completed tasks and success states
- **Danger**: Red (#ef4444) - Required tasks and alerts
- **Warning**: Yellow (#f59e0b) - Attention needed
- **Neutral**: Gray scale for text and backgrounds

### Component Architecture
- **Atomic Design**: Small, reusable components
- **Props Interface**: Strongly typed component interfaces
- **State Management**: Local state with auto-save functionality
- **Event Handling**: Comprehensive callback system for user interactions

## 🔄 Data Flow

### State Management
1. **Initial Load**: Load preset template or saved progress from localStorage
2. **User Interactions**: Update component state and trigger re-renders
3. **Auto-Save**: Debounced saves to localStorage on state changes
4. **Progress Calculation**: Real-time computation of completion metrics
5. **Export**: Generate JSON snapshot of current state

### Data Persistence
- **LocalStorage**: Automatic saving with 1-second debounce
- **Export/Import**: JSON format for data portability
- **GitHub Sync**: Future integration for cloud backup (UI ready)
- **Database Migration**: Easy transition from localStorage to database

## 🚧 Future Enhancements

### Phase 2 - API Integration
- [ ] Backend API for data persistence
- [ ] User authentication and multi-user support
- [ ] Real-time collaboration features
- [ ] Cloud image storage integration

### Phase 3 - Advanced Features
- [ ] Custom checklist templates
- [ ] Reporting and analytics dashboard
- [ ] Team management and assignments
- [ ] Mobile app development
- [ ] Offline-first PWA capabilities

### Phase 4 - Integrations
- [ ] GitHub Actions for automated workflows
- [ ] Calendar integration for scheduling
- [ ] Notification system
- [ ] PDF report generation
- [ ] Third-party API integrations

## 🤝 Contributing

### Development Guidelines
1. **TypeScript**: Maintain strict type safety
2. **Component Design**: Keep components small and focused
3. **Accessibility**: Follow WCAG guidelines
4. **Performance**: Optimize for mobile and low-bandwidth
5. **Testing**: Write unit tests for critical functionality

### Code Style
- **ESLint**: Follow the configured linting rules
- **Prettier**: Auto-format code on save
- **Naming**: Use descriptive, camelCase names
- **Comments**: Document complex logic and interfaces

## 📁 File Organization

### Uploads Directory
- **Location**: `public/uploads/`
- **Purpose**: Store user-uploaded images
- **API Integration**: Ready for future API implementation
- **Format Support**: jpg, png, gif, webp

### Saved Directory
- **Location**: `public/saved/`
- **Purpose**: Store exported checklist data
- **Format**: JSON files with timestamps
- **GitHub Sync**: Integration ready

## 🔧 Configuration

### Environment Variables
```bash
CUSTOM_KEY=prework-app
VERSION=1.0.0
NODE_ENV=development
```

### Tailwind Configuration
- **Custom Colors**: Extended color palette
- **Animations**: Custom transitions and keyframes
- **Responsive**: Mobile-first breakpoints
- **Dark Mode**: Ready for future implementation

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🆘 Support

### Common Issues
1. **Build Errors**: Ensure Node.js 18+ and clean npm cache
2. **TypeScript Errors**: Run `npm run type-check` for detailed diagnostics
3. **Styling Issues**: Verify Tailwind CSS is properly configured
4. **LocalStorage**: Check browser privacy settings

### Getting Help
- Review the TypeScript interfaces in `src/types/index.ts`
- Check the console for runtime errors
- Ensure all dependencies are properly installed
- Verify file paths match the project structure

---

**Built with ❤️ for efficient pre-work management**

*Version 1.0.0 - React Server + Next.js App Router + TypeScript + Tailwind CSS*
│   │   │   └── Footer.tsx
│   │   └── UI
│   │       ├── Button.tsx
│   │       └── Modal.tsx
│   ├── lib
│   │   ├── storage.ts
│   │   └── utils.ts
│   ├── data
│   │   └── presetChecklists.ts
│   └── types
│       └── index.ts
├── public
│   ├── uploads
│   └── saved
├── package.json
├── next.config.js
├── tsconfig.json
└── README.md
```

## Getting Started
1. **Clone the Repository**: 
   ```
   git clone <repository-url>
   cd pre-work-app
   ```

2. **Install Dependencies**: 
   ```
   npm install
   ```

3. **Run the Application**: 
   ```
   npm run dev
   ```

4. **Access the App**: Open your browser and navigate to `http://localhost:3000`.

## Contributing
If you would like to contribute to this project, please fork the repository and submit a pull request with your changes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.