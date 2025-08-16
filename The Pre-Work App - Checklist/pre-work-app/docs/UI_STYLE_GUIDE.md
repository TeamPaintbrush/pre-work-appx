# 🎨 UI Style Guide - Pre-Work App

## Overview
This style guide defines the visual language, design principles, and component standards for the Pre-Work App. It ensures consistency across all interfaces and provides guidelines for future development.

---

## 🚀 Enhanced Checklist Features

### Local Storage & Auto-save
- **Auto-save**: Checklists automatically save every 30 seconds
- **Local Storage**: Data persists between browser sessions
- **Error Handling**: Graceful fallbacks for storage failures

```tsx
// Using Enhanced Checklist Hook
const {
  checklist,
  progress,
  milestones,
  actions: { toggleItem, addItem, saveChecklist }
} = useEnhancedChecklist(initialChecklist, {
  autoSave: true,
  autoSaveInterval: 30000,
  trackProgress: true
});
```

### Progress Tracking & Analytics
- **Real-time Progress**: Updates automatically as items are completed
- **Milestones**: Achievement tracking at 25%, 50%, 75%, and 100%
- **Time Tracking**: Session duration and estimated completion time
- **Analytics**: Completion rates and performance metrics

```tsx
// Progress Display
<EnhancedProgressBar 
  progress={progress} 
  checklist={checklist}
  showDetails={true}
  onMilestoneReached={(milestone) => showNotification(milestone)}
/>
```

### Export & Sharing
- **JSON Export**: Full data export with timestamps
- **PDF Generation**: Professional formatted reports (planned)
- **Email Sharing**: Direct sharing capabilities (planned)
- **Web Links**: Shareable checklist links (planned)

### Data Persistence
- **Local Storage Service**: Centralized data management
- **Activity Logging**: User action tracking
- **Template Management**: Save and reuse custom templates
- **Preferences**: User settings persistence

---

## 🎯 Design Principles

### 1. **Professional & Clean**
- Minimalist design with purposeful elements
- Clear hierarchy and visual flow
- Enterprise-grade appearance

### 2. **Mobile-First**
- Responsive design prioritizing mobile experience
- Touch-friendly interface elements
- Optimized for field workers and mobile devices

### 3. **Accessibility-Focused**
- WCAG 2.1 AA compliance
- High contrast ratios
- Keyboard navigation support
- Screen reader compatibility

### 4. **Performance-Oriented**
- Fast loading times
- Smooth animations
- Efficient component rendering

---

## 🎨 Color Palette

### Primary Colors
```css
/* Blue Scale - Primary Brand */
--blue-50:  #eff6ff;   /* Light background */
--blue-100: #dbeafe;   /* Subtle accents */
--blue-200: #bfdbfe;   /* Hover states */
--blue-300: #93c5fd;   /* Secondary elements */
--blue-400: #60a5fa;   /* Interactive elements */
--blue-500: #3b82f6;   /* Primary buttons */
--blue-600: #2563eb;   /* Primary brand */
--blue-700: #1d4ed8;   /* Hover primary */
--blue-800: #1e40af;   /* Hero gradients */
--blue-900: #1e3a8a;   /* Dark accents */
```

### Neutral Colors
```css
/* Gray Scale - Text & Backgrounds */
--gray-50:  #f9fafb;   /* Page backgrounds */
--gray-100: #f3f4f6;   /* Card backgrounds */
--gray-200: #e5e7eb;   /* Borders */
--gray-300: #d1d5db;   /* Disabled states */
--gray-400: #9ca3af;   /* Placeholder text */
--gray-500: #6b7280;   /* Secondary text */
--gray-600: #4b5563;   /* Primary text */
--gray-700: #374151;   /* Headings */
--gray-800: #1f2937;   /* Dark text */
--gray-900: #111827;   /* High contrast */
```

### Status Colors
```css
/* Success */
--green-500: #10b981;  /* Success states */
--green-600: #059669;  /* Success hover */
--green-100: #d1fae5;  /* Success background */

/* Warning */
--yellow-500: #f59e0b; /* Warning states */
--yellow-600: #d97706; /* Warning hover */
--yellow-100: #fef3c7; /* Warning background */

/* Error */
--red-500: #ef4444;    /* Error states */
--red-600: #dc2626;    /* Error hover */
--red-100: #fee2e2;    /* Error background */

/* Info */
--indigo-500: #6366f1; /* Info states */
--indigo-600: #4f46e5; /* Info hover */
--indigo-100: #e0e7ff; /* Info background */
```

---

## 📝 Typography

### Font Family
```css
/* Primary Font */
font-family: 'Inter', system-ui, -apple-system, sans-serif;

/* Monospace (for code) */
font-family: 'JetBrains Mono', 'Fira Code', monospace;
```

### Font Scales
```css
/* Headings */
.text-6xl { font-size: 3.75rem; line-height: 1; }     /* Hero titles */
.text-5xl { font-size: 3rem; line-height: 1; }       /* Page titles */
.text-4xl { font-size: 2.25rem; line-height: 2.5rem; } /* Section titles */
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; } /* Card titles */
.text-2xl { font-size: 1.5rem; line-height: 2rem; }   /* Subsections */
.text-xl { font-size: 1.25rem; line-height: 1.75rem; } /* Large text */

/* Body Text */
.text-lg { font-size: 1.125rem; line-height: 1.75rem; } /* Large body */
.text-base { font-size: 1rem; line-height: 1.5rem; }   /* Default body */
.text-sm { font-size: 0.875rem; line-height: 1.25rem; } /* Small text */
.text-xs { font-size: 0.75rem; line-height: 1rem; }    /* Captions */
```

### Font Weights
```css
.font-thin { font-weight: 100; }     /* Rarely used */
.font-light { font-weight: 300; }    /* Light text */
.font-normal { font-weight: 400; }   /* Body text */
.font-medium { font-weight: 500; }   /* Emphasized text */
.font-semibold { font-weight: 600; } /* Subheadings */
.font-bold { font-weight: 700; }     /* Headings */
.font-extrabold { font-weight: 800; } /* Hero text */
```

---

## 📐 Spacing & Layout

### Spacing Scale
```css
/* Tailwind Spacing (rem values) */
--space-1:  0.25rem;  /* 4px  - Fine details */
--space-2:  0.5rem;   /* 8px  - Small gaps */
--space-3:  0.75rem;  /* 12px - Text spacing */
--space-4:  1rem;     /* 16px - Default gap */
--space-5:  1.25rem;  /* 20px - Medium gap */
--space-6:  1.5rem;   /* 24px - Card padding */
--space-8:  2rem;     /* 32px - Section gap */
--space-10: 2.5rem;   /* 40px - Large gap */
--space-12: 3rem;     /* 48px - Section padding */
--space-16: 4rem;     /* 64px - Page sections */
--space-20: 5rem;     /* 80px - Large sections */
```

### Container Widths
```css
/* Max widths for content */
.max-w-xs { max-width: 20rem; }     /* 320px - Mobile cards */
.max-w-sm { max-width: 24rem; }     /* 384px - Small forms */
.max-w-md { max-width: 28rem; }     /* 448px - Medium forms */
.max-w-lg { max-width: 32rem; }     /* 512px - Large forms */
.max-w-xl { max-width: 36rem; }     /* 576px - Content width */
.max-w-2xl { max-width: 42rem; }    /* 672px - Article width */
.max-w-4xl { max-width: 56rem; }    /* 896px - Dashboard */
.max-w-7xl { max-width: 80rem; }    /* 1280px - Page container */
```

### Grid System
```css
/* Responsive Grid Classes */
.grid-cols-1     /* Mobile: 1 column */
.md:grid-cols-2  /* Tablet: 2 columns */
.lg:grid-cols-3  /* Desktop: 3 columns */
.xl:grid-cols-4  /* Large: 4 columns */

/* Common Grid Gaps */
.gap-4   /* 16px - Default gap */
.gap-6   /* 24px - Card grids */
.gap-8   /* 32px - Section grids */
```

---

## 🧩 Component Standards

### Buttons

#### Primary Button
```tsx
<button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200">
  Primary Action
</button>
```

#### Secondary Button
```tsx
<button className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200">
  Secondary Action
</button>
```

#### Button Sizes
```css
/* Small */
.btn-sm { padding: 0.5rem 0.75rem; font-size: 0.875rem; }

/* Medium (Default) */
.btn-md { padding: 0.5rem 1rem; font-size: 1rem; }

/* Large */
.btn-lg { padding: 0.75rem 1.5rem; font-size: 1.125rem; }
```

### Cards

#### Standard Card (Current Implementation)
```tsx
<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Card Title</h3>
  <p className="text-gray-600 dark:text-gray-400">Card content goes here.</p>
</div>
```

#### Template Card (Gallery Pattern)
```tsx
<div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
  <div className="flex items-start space-x-3">
    <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-500 rounded mt-0.5"></div>
    <div className="flex-1">
      <p className="text-gray-900 dark:text-white font-medium">Template Title</p>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Description</p>
      {/* Tags */}
      <div className="flex flex-wrap gap-1 mt-2">
        <span className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-xs px-2 py-0.5 rounded">
          Tag Name
        </span>
      </div>
    </div>
  </div>
</div>
```

#### Feature Card (Homepage)
```tsx
<div className="text-center p-6 bg-gray-50 rounded-lg">
  <div className="w-12 h-12 bg-blue-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {/* Icon SVG */}
    </svg>
  </div>
  <h3 className="text-xl font-semibold text-gray-900 mb-2">Feature Title</h3>
  <p className="text-gray-600">Feature description text</p>
</div>
```

### Tags & Badges

#### Primary Tags (Blue Theme)
```tsx
<span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs px-2 py-1 rounded">
  Primary Tag
</span>
```

#### Secondary Tags (Gray Theme)
```tsx
<span className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded">
  Secondary Tag
</span>
```

#### Status Badges
```tsx
/* Success Badge */
<span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
  Completed
</span>

/* Warning Badge */
<span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
  In Progress
</span>

/* Error Badge */
<span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
  Failed
</span>
```

#### Skill/Category Tags
```tsx
<span className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-xs px-2 py-0.5 rounded">
  Required Skill
</span>
```

### Filter & Search Components

#### Search Input (Current Implementation)
```tsx
<input 
  type="text" 
  placeholder="Search templates..."
  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
/>
```

#### Filter Dropdown
```tsx
<select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
  <option value="all">All Difficulty</option>
  <option value="easy">Easy</option>
  <option value="medium">Medium</option>
  <option value="hard">Hard</option>
</select>
```

#### Input Fields
```tsx
<input 
  type="text" 
  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  placeholder="Enter text..."
/>
```

#### Labels
```tsx
<label className="block text-sm font-medium text-gray-700 mb-1">
  Field Label
</label>
```

### Navigation

#### Header Navigation (Current Implementation)
```tsx
/* Sticky Header with Animation */
<motion.header 
  className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40 px-6 py-4"
  initial={{ y: -100 }}
  animate={{ y: 0 }}
  transition={{ duration: 0.3 }}
>
  <div className="max-w-7xl mx-auto">
    <div className="flex items-center justify-between">
      {/* Logo section with responsive sizing */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <ClipboardIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Pre-Work App</h1>
          <p className="text-sm text-gray-600">Your checklist companion</p>
        </div>
      </div>
      
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-8">
        <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
          Dashboard
        </Link>
        <Link href="/templates" className="px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
          Templates
        </Link>
      </nav>
    </div>
  </div>
</motion.header>
```

#### Mobile Navigation (Bottom Bar)
```tsx
<nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
  <div className="grid grid-cols-4 h-16">
    {/* Navigation items with touch-friendly sizing */}
  </div>
</nav>
```

---

## 🎭 Animation Guidelines

### Transition Durations
```css
.duration-75  { transition-duration: 75ms; }   /* Micro interactions */
.duration-150 { transition-duration: 150ms; }  /* Hover states */
.duration-200 { transition-duration: 200ms; }  /* Default transitions */
.duration-300 { transition-duration: 300ms; }  /* Page transitions */
.duration-500 { transition-duration: 500ms; }  /* Large animations */
```

### Easing Functions
```css
.ease-linear    /* Linear progression */
.ease-in        /* Slow start */
.ease-out       /* Slow end */
.ease-in-out    /* Slow start and end */
```

### Framer Motion Variants
```tsx
// Page transitions
export const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};

// Container animations
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Item animations
export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};
```

---

## 🌙 Dark Mode Implementation

### Dark Mode Classes
The application implements comprehensive dark mode support using Tailwind's `dark:` prefix:

```tsx
/* Background Colors */
className="bg-white dark:bg-gray-800"          /* Cards/containers */
className="bg-gray-50 dark:bg-gray-900"       /* Page backgrounds */
className="bg-gray-100 dark:bg-gray-700"      /* Secondary backgrounds */

/* Text Colors */
className="text-gray-900 dark:text-white"     /* Primary text */
className="text-gray-600 dark:text-gray-400"  /* Secondary text */
className="text-gray-500 dark:text-gray-500"  /* Muted text */

/* Border Colors */
className="border-gray-200 dark:border-gray-700"  /* Standard borders */
className="border-gray-300 dark:border-gray-600"  /* Input borders */
```

### Dark Mode Toggle Pattern
```tsx
<button 
  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
  onClick={toggleDarkMode}
>
  <SunIcon className="w-5 h-5 block dark:hidden" />
  <MoonIcon className="w-5 h-5 hidden dark:block" />
</button>
```

---

## 📱 Mobile-First Patterns

### Touch-Friendly Sizing
```css
/* Minimum touch target size for mobile */
.min-h-[44px] .min-w-[44px]  /* 44px minimum for iOS guidelines */

/* Responsive spacing */
className="p-2 md:p-4"        /* Smaller padding on mobile */
className="text-sm md:text-base"  /* Smaller text on mobile */
```

### Mobile Navigation Pattern
```tsx
/* Responsive navigation display */
<nav className="hidden md:flex items-center space-x-8">
  {/* Desktop navigation */}
</nav>

/* Mobile menu button */
<button className="md:hidden p-2 rounded-lg">
  <MenuIcon className="w-6 h-6" />
</button>
```

---

## 🎯 Current Application Patterns

### Breakpoints
```css
/* Tailwind CSS Breakpoints */
sm:   /* 640px  - Small tablets */
md:   /* 768px  - Tablets */
lg:   /* 1024px - Small laptops */
xl:   /* 1280px - Laptops */
2xl:  /* 1536px - Large screens */
```

### Mobile-First Approach
```tsx
// Start with mobile styles, add larger screen styles
<div className="
  text-sm          /* Mobile: small text */
  md:text-base     /* Tablet: normal text */
  lg:text-lg       /* Desktop: large text */
  
  p-4              /* Mobile: 16px padding */
  md:p-6           /* Tablet: 24px padding */
  lg:p-8           /* Desktop: 32px padding */
  
  grid-cols-1      /* Mobile: 1 column */
  md:grid-cols-2   /* Tablet: 2 columns */
  lg:grid-cols-3   /* Desktop: 3 columns */
">
  Content
</div>
```

---

## ♿ Accessibility Standards

### Color Contrast
- **Normal text**: 4.5:1 minimum contrast ratio
- **Large text**: 3:1 minimum contrast ratio
- **Interactive elements**: Clear focus indicators

### Focus Management
```css
/* Focus rings */
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
}

/* Focus within containers */
.focus-within:focus-within {
  @apply ring-2 ring-blue-500;
}
```

### ARIA Labels
```tsx
// Buttons with icons
<button aria-label="Close modal">
  <XIcon className="w-5 h-5" />
</button>

// Form inputs
<input 
  type="email"
  aria-describedby="email-help"
  aria-required="true"
/>
<div id="email-help">Enter your email address</div>
```

---

## �️ Current Layout Patterns

### Hero Section (Homepage)
```tsx
/* Gradient hero with animated content */
<section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <motion.div 
      className="text-center"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 
        className="text-4xl md:text-6xl font-bold mb-6"
        variants={itemVariants}
      >
        The Pre-Work App
      </motion.h1>
      <motion.p 
        className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto"
        variants={itemVariants}
      >
        Streamline your cleaning and maintenance pre-work processes
      </motion.p>
    </motion.div>
  </div>
</section>
```

### Page Container Pattern
```tsx
/* Standard page wrapper with motion */
<motion.div 
  className="min-h-screen bg-gray-50"
  variants={pageVariants}
  initial="initial"
  animate="in"
  exit="out"
  transition={pageTransition}
>
  {/* Page content */}
</motion.div>
```

### Feature Grid (Homepage)
```tsx
/* Responsive feature showcase */
<section className="py-16 bg-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <div className="w-12 h-12 bg-blue-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
          <IconComponent className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Feature Title</h3>
        <p className="text-gray-600">Feature description</p>
      </div>
    </div>
  </div>
</section>
```

---

## �🎪 Icons & Graphics

### Icon Library
- **Primary**: Heroicons (outline and solid)
- **Size Standard**: 16px (w-4 h-4), 20px (w-5 h-5), 24px (w-6 h-6)
- **Usage**: Consistent stroke width, proper sizing

### Icon Usage
```tsx
import { UserIcon, CogIcon } from '@heroicons/react/24/outline';

// Standard sizes
<UserIcon className="w-5 h-5 text-gray-500" />      /* 20px */
<CogIcon className="w-6 h-6 text-gray-600" />       /* 24px */
```

### Image Guidelines
- **Format**: WebP with PNG fallback
- **Optimization**: Next.js Image component
- **Alt text**: Descriptive alternative text
- **Aspect ratios**: 16:9 for banners, 1:1 for avatars

---

## 🚀 Performance Guidelines

### CSS Best Practices
- Use Tailwind utilities over custom CSS
- Minimize custom styles
- Leverage Tailwind's purging for smaller builds

### Component Optimization
```tsx
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* Heavy rendering */}</div>;
});

// Lazy load components
const LazyComponent = lazy(() => import('./HeavyComponent'));
```

---

## 📋 Component Checklist

When creating new components, ensure:

- [ ] **Responsive Design**: Works on all screen sizes
- [ ] **Accessibility**: ARIA labels, focus management
- [ ] **TypeScript**: Proper type definitions
- [ ] **Consistent Styling**: Follows style guide
- [ ] **Performance**: Optimized rendering
- [ ] **Testing**: Unit tests included
- [ ] **Documentation**: Props and usage examples

---

## 🔄 Evolution Guidelines

This style guide is a living document. When making changes:

1. **Document Changes**: Update this guide when adding new patterns
2. **Consistency Check**: Ensure new components match existing patterns
3. **Team Review**: Get approval for major style changes
4. **Version Control**: Track style guide versions with releases

---

## 📚 Resources

### Tools
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **Heroicons**: Icon library
- **Inter Font**: Primary typeface

### References
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Framer Motion Documentation](https://www.framer.com/motion/)

---

**Last Updated**: August 15, 2025
**Version**: 1.0.0
