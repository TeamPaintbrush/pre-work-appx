# 🎨 Component Guide - Pre-Work App

## Overview
This guide covers all React components in the Pre-Work App, their props, usage examples, and best practices.

---

## 📁 Component Structure

```
src/components/
├── Animation/           # Animation providers and utilities
├── AuditLog/           # Audit logging components
├── Checklist/          # Checklist and task management
├── Compliance/         # Compliance checking tools
├── CustomFields/       # Dynamic form field management
├── Export/             # PDF and data export tools
├── Layout/             # Page layout components
├── Media/              # File upload and media handling
├── Navigation/         # Navigation and routing
├── Profile/            # User profile management
├── Progress/           # Progress tracking and analytics
├── Reminders/          # Notification and reminder system
├── Settings/           # Application settings
├── Sharing/            # Template and content sharing
├── Templates/          # Template creation and management
└── UI/                 # Reusable UI components
```

---

## 🎭 Animation Components

### AnimationProvider
Provides Framer Motion context for the entire application.

```tsx
import { AnimationProvider } from '@/components/Animation/AnimationProvider';

function App() {
  return (
    <AnimationProvider>
      <YourAppContent />
    </AnimationProvider>
  );
}
```

**Props:**
- `children: ReactNode` - Child components
- `reducedMotion?: boolean` - Disable animations for accessibility

---

## 📋 Checklist Components

### ChecklistContainer
Main container for managing checklists and sections.

```tsx
import { ChecklistContainer } from '@/components/Checklist/ChecklistContainer';

function WorkflowPage() {
  return (
    <ChecklistContainer
      checklistId="workflow-123"
      userId="user-456"
      onUpdate={(checklist) => console.log('Updated:', checklist)}
    />
  );
}
```

**Props:**
- `checklistId: string` - Unique checklist identifier
- `userId: string` - Current user ID
- `onUpdate?: (checklist: Checklist) => void` - Update callback
- `readOnly?: boolean` - Disable editing

### ChecklistItem
Individual checklist item with completion tracking.

```tsx
import { ChecklistItem } from '@/components/Checklist/ChecklistItem';

const item = {
  id: 'item-1',
  title: 'Complete setup',
  description: 'Install all dependencies',
  isCompleted: false,
  priority: 'high',
  dueDate: '2024-01-20'
};

<ChecklistItem
  item={item}
  onToggle={(id, completed) => handleToggle(id, completed)}
  onEdit={(item) => handleEdit(item)}
/>
```

**Props:**
- `item: ChecklistItem` - Item data
- `onToggle: (id: string, completed: boolean) => void` - Toggle completion
- `onEdit?: (item: ChecklistItem) => void` - Edit callback
- `showPriority?: boolean` - Display priority indicator

### AddItemForm
Form for adding new checklist items.

```tsx
import { AddItemForm } from '@/components/Checklist/AddItemForm';

<AddItemForm
  sectionId="section-123"
  onAdd={(item) => handleAddItem(item)}
  onCancel={() => setShowForm(false)}
/>
```

**Props:**
- `sectionId: string` - Parent section ID
- `onAdd: (item: Partial<ChecklistItem>) => void` - Add callback
- `onCancel: () => void` - Cancel callback

### ProgressBar
Visual progress indicator for checklist completion.

```tsx
import { ProgressBar } from '@/components/Checklist/ProgressBar';

<ProgressBar
  completed={15}
  total={20}
  showPercentage={true}
  size="large"
  color="primary"
/>
```

**Props:**
- `completed: number` - Number of completed items
- `total: number` - Total number of items
- `showPercentage?: boolean` - Display percentage text
- `size?: 'small' | 'medium' | 'large'` - Bar size
- `color?: 'primary' | 'secondary' | 'success'` - Color theme

---

## 📱 Media Components

### MediaCapture
Camera and file upload component with preview.

```tsx
import { MediaCapture } from '@/components/Media/MediaCapture';

<MediaCapture
  onCapture={(file) => handleFileUpload(file)}
  acceptedTypes={['image/jpeg', 'image/png']}
  maxSize={5 * 1024 * 1024} // 5MB
  showPreview={true}
/>
```

**Props:**
- `onCapture: (file: File) => void` - File capture callback
- `acceptedTypes?: string[]` - Allowed MIME types
- `maxSize?: number` - Maximum file size in bytes
- `showPreview?: boolean` - Show image preview
- `multiple?: boolean` - Allow multiple files

### BeforeAfterComparison
Side-by-side image comparison component.

```tsx
import { BeforeAfterComparison } from '@/components/Media/BeforeAfterComparison';

<BeforeAfterComparison
  beforeImage="/images/before.jpg"
  afterImage="/images/after.jpg"
  title="Renovation Progress"
/>
```

**Props:**
- `beforeImage: string` - URL to before image
- `afterImage: string` - URL to after image
- `title?: string` - Comparison title
- `orientation?: 'horizontal' | 'vertical'` - Layout direction

---

## 👤 Profile Components

### UserProfileManager
Complete profile management interface.

```tsx
import { UserProfileManager } from '@/components/Profile/UserProfileManager';

<UserProfileManager
  userId="user-123"
  profiles={userProfiles}
  onProfileUpdate={(profile) => handleUpdate(profile)}
  onProfileCreate={(profile) => handleCreate(profile)}
  allowMultipleProfiles={true}
/>
```

**Props:**
- `userId: string` - Current user ID
- `profiles: UserProfile[]` - User's profiles
- `onProfileUpdate: (profile: UserProfile) => void` - Update callback
- `onProfileCreate: (profile: Partial<UserProfile>) => void` - Create callback
- `allowMultipleProfiles?: boolean` - Enable multiple profiles

---

## 📊 Progress Components

### EnhancedProgressBar
Advanced progress bar with animations and milestones.

```tsx
import { EnhancedProgressBar } from '@/components/Progress/EnhancedProgressBar';

<EnhancedProgressBar
  progress={75}
  milestones={[25, 50, 75, 100]}
  showMilestones={true}
  animated={true}
  size="large"
/>
```

**Props:**
- `progress: number` - Progress percentage (0-100)
- `milestones?: number[]` - Milestone percentages
- `showMilestones?: boolean` - Display milestone markers
- `animated?: boolean` - Enable animations
- `size?: 'small' | 'medium' | 'large'`

---

## 🎨 UI Components

### Button
Customizable button component with variants and states.

```tsx
import { Button } from '@/components/UI/Button';

<Button
  variant="primary"
  size="medium"
  onClick={() => handleClick()}
  disabled={false}
  loading={false}
>
  Click Me
</Button>
```

**Props:**
- `children: ReactNode` - Button content
- `variant?: 'primary' | 'secondary' | 'outline' | 'ghost'` - Style variant
- `size?: 'small' | 'medium' | 'large'` - Button size
- `onClick?: () => void` - Click handler
- `disabled?: boolean` - Disabled state
- `loading?: boolean` - Loading state with spinner
- `type?: 'button' | 'submit' | 'reset'` - HTML button type

### Modal
Accessible modal dialog component.

```tsx
import { Modal } from '@/components/UI/Modal';

<Modal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title="Confirm Action"
  size="medium"
  closeOnOverlayClick={true}
>
  <p>Are you sure you want to continue?</p>
  <div className="flex gap-2 mt-4">
    <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
    <Button variant="primary" onClick={handleConfirm}>Confirm</Button>
  </div>
</Modal>
```

**Props:**
- `isOpen: boolean` - Modal visibility
- `onClose: () => void` - Close callback
- `title?: string` - Modal title
- `size?: 'small' | 'medium' | 'large'` - Modal size
- `closeOnOverlayClick?: boolean` - Close on backdrop click
- `children: ReactNode` - Modal content

### Skeleton
Loading skeleton component for better UX.

```tsx
import { Skeleton } from '@/components/UI/Skeleton';

<Skeleton
  height="h-4"
  width="w-full"
  rounded="rounded"
  animate={true}
/>
```

**Props:**
- `height?: string` - Tailwind height class
- `width?: string` - Tailwind width class
- `rounded?: string` - Tailwind border radius class
- `animate?: boolean` - Enable pulse animation

---

## 🎯 Template Components

### TemplateGallery
Grid view of available templates with filtering.

```tsx
import { TemplateGallery } from '@/components/Templates/TemplateGallery';

<TemplateGallery
  templates={availableTemplates}
  onSelect={(template) => handleTemplateSelect(template)}
  categories={['work', 'personal', 'health']}
  showSearch={true}
/>
```

**Props:**
- `templates: Template[]` - Available templates
- `onSelect: (template: Template) => void` - Selection callback
- `categories?: string[]` - Filter categories
- `showSearch?: boolean` - Enable search functionality

### CreateTemplateModal
Modal for creating new templates.

```tsx
import { CreateTemplateModal } from '@/components/Templates/CreateTemplateModal';

<CreateTemplateModal
  isOpen={showCreateModal}
  onClose={() => setShowCreateModal(false)}
  onCreate={(template) => handleCreateTemplate(template)}
  categories={templateCategories}
/>
```

**Props:**
- `isOpen: boolean` - Modal visibility
- `onClose: () => void` - Close callback
- `onCreate: (template: Template) => void` - Create callback
- `categories?: string[]` - Available categories

---

## ⚙️ Settings Components

### SettingsManager
Complete settings management interface.

```tsx
import { SettingsManager } from '@/components/Settings/SettingsManager';

<SettingsManager
  userId="user-123"
  settings={userSettings}
  onUpdate={(settings) => handleSettingsUpdate(settings)}
/>
```

**Props:**
- `userId: string` - Current user ID
- `settings: UserSettings` - Current settings
- `onUpdate: (settings: UserSettings) => void` - Update callback

---

## 🚀 Best Practices

### Component Development
1. **Type Safety**: Use TypeScript interfaces for all props
2. **Accessibility**: Include ARIA labels and keyboard navigation
3. **Performance**: Use React.memo for expensive components
4. **Testing**: Write unit tests for complex logic

### State Management
1. **Local State**: Use useState for component-specific state
2. **Global State**: Use Context API for shared state
3. **Server State**: Use SWR or React Query for API data
4. **Form State**: Use react-hook-form for complex forms

### Styling
1. **Tailwind CSS**: Use utility classes for consistent styling
2. **CSS Modules**: Use for complex component-specific styles
3. **Theme**: Follow the design system color palette
4. **Responsive**: Mobile-first responsive design

### Error Handling
1. **Error Boundaries**: Wrap components in error boundaries
2. **Loading States**: Show skeleton loaders during data fetching
3. **Empty States**: Provide helpful empty state messages
4. **Validation**: Client-side validation with server-side backup
