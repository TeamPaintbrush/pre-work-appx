# Template Gallery Layout - Reference Backup

**Created:** August 18, 2025  
**Purpose:** Backup reference for the correct template gallery navigation pattern

---

## 🎯 Correct Template Gallery Layout

### **Navigation Flow (Current Working Implementation)**

1. **Initial View**: Category Cards Display
   - Shows 9 template categories as cards
   - Each card displays: icon, name, description, template count
   - Responsive grid layout (1 column mobile, 2 columns tablet, 3 columns desktop)

2. **Category Selection**: Click into Category
   - Click any category card → navigate to templates within that category
   - Shows search bar and sorting options
   - Displays templates in grid layout
   - Shows "← Back to Categories" button

3. **Back Navigation**: Return to Categories
   - Click "← Back to Categories" → return to category overview
   - Clears search and resets view mode

---

## 🎨 Visual Layout Structure

### **Category Cards View (Default)**
```
┌─────────────────────────────────────────────────────────┐
│                    Template Gallery                     │
│                9 template categories                    │
│                                                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                │
│  │ 🧹      │  │ 🏗️      │  │ 🎨      │                │
│  │Cleaning │  │Construct│  │ Event   │                │
│  │28 tmpl  │  │10 tmpl  │  │16 tmpl  │                │
│  └─────────┘  └─────────┘  └─────────┘                │
│                                                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                │
│  │ 🏥      │  │ 🏨      │  │ 🎯      │                │
│  │Healthcare│  │Hospital │  │ Safety  │                │
│  │12 tmpl  │  │35 tmpl  │  │12 tmpl  │                │
│  └─────────┘  └─────────┘  └─────────┘                │
│                                                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                │
│  │ 🔧      │  │ 🎪      │  │         │                │
│  │Equipment│  │Event Stp│  │         │                │
│  │15 tmpl  │  │7 tmpl   │  │         │                │
│  └─────────┘  └─────────┘  └─────────┘                │
└─────────────────────────────────────────────────────────┘
```

### **Templates View (After Category Click)**
```
┌─────────────────────────────────────────────────────────┐
│  ← Back to Categories        Template Gallery           │
│  28 templates in Cleaning & Maintenance                 │
│                                                         │
│  🔍 [Search templates...]     [Sort by Name ▼]         │
│                                                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                │
│  │Office   │  │Deep     │  │Carpet   │                │
│  │Cleaning │  │Clean    │  │Clean    │                │
│  │⭐ 45min │  │⭐ 60min │  │⭐ 30min │                │
│  │[Use]    │  │[Use]    │  │[Use]    │                │
│  └─────────┘  └─────────┘  └─────────┘                │
│                                                         │
│  [... more template cards ...]                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Technical Implementation Details

### **React Component Structure**
```tsx
TemplateGallery {
  viewMode: 'categories' | 'templates'
  selectedCategory: string | null
  
  // Category view: show TemplateCategoryCard components
  // Templates view: show template cards with search/sort
}
```

### **State Management**
```tsx
const [viewMode, setViewMode] = useState<'categories' | 'templates'>('categories');
const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
const [searchTerm, setSearchTerm] = useState('');
const [sortBy, setSortBy] = useState<'name' | 'category' | 'recent'>('name');
```

### **Navigation Functions**
```tsx
// Click category → show templates
const handleCategoryClick = (categoryId: string) => {
  setSelectedCategory(categoryId);
  setViewMode('templates');
  setSearchTerm(''); // Clear search when entering category
};

// Back button → show categories
const handleBackToCategories = () => {
  setViewMode('categories');
  setSelectedCategory(null);
  setSearchTerm('');
};
```

---

## 📊 Category Data Structure

### **Template Categories (9 Total)**
1. **Cleaning & Maintenance** - 28 templates - 🧹
2. **Construction & Building** - 10 templates - 🏗️
3. **Event Preparation** - 16 templates - 🎨
4. **Healthcare & Medical** - 12 templates - 🏥
5. **Hospitality & Service** - 35 templates - 🏨
6. **Safety & Inspection** - 12 templates - 🎯
7. **Equipment & Maintenance** - 15 templates - 🔧
8. **Event Setup** - 7 templates - 🎪
9. **Painting & Decorating** - 14 templates - 🎨

**Total: 149 templates across 9 categories**

---

## ✅ User Experience Flow

### **Step 1: Landing on /templates**
- User sees 9 category cards in responsive grid
- Each card shows icon, name, description, template count
- Hover effects and animations for engagement
- No search bar visible (only shows in templates view)

### **Step 2: Selecting a Category**
- User clicks "Cleaning & Maintenance" card
- Page transitions to templates view
- Header updates: "28 templates in Cleaning & Maintenance"
- Search bar and sort dropdown appear
- "← Back to Categories" button appears
- Templates for that category display in grid

### **Step 3: Template Interaction**
- User can search templates within the category
- User can sort by name, category, or recent
- User clicks "Use Template" → creates checklist
- User can favorite templates (star icon)

### **Step 4: Navigation Back**
- User clicks "← Back to Categories"
- Returns to category cards view
- Search term cleared
- View mode reset to 'categories'

---

## 🎨 Design Specifications

### **Category Cards**
- **Background:** White with border and shadow
- **Icon:** Large category emoji with colored background
- **Typography:** Title (xl font-semibold), description (sm text-gray-600)
- **Badge:** Template count in gray pill
- **Hover:** Scale transform, increased shadow
- **Animation:** Framer Motion with whileHover effects

### **Template Cards**
- **Background:** White with border
- **Header:** Template name (lg font-semibold)
- **Content:** Description, stats (items count, estimated time)
- **Actions:** Favorite star, "Use Template" button
- **Hover:** Border color change, shadow increase

### **Navigation Elements**
- **Back Button:** Blue text with arrow icon, hover background
- **Search Bar:** Full width with search icon, focus ring
- **Sort Dropdown:** Styled select with blue focus ring

---

## 🔍 Search & Filter Behavior

### **Search Functionality**
- **Scope:** Only active when in templates view
- **Fields:** Searches template name, description, category name
- **Real-time:** Updates results as user types
- **Case-insensitive:** Flexible matching

### **Sort Options**
1. **Sort by Name:** Alphabetical (A-Z)
2. **Sort by Category:** Group by category name
3. **Recently Updated:** Newest first (based on createdAt)

---

## 🚨 Important Layout Rules

### **DO:**
- ✅ Show category cards first (default view)
- ✅ Navigate into categories to see templates
- ✅ Provide clear "Back to Categories" navigation
- ✅ Keep search/sort only in templates view
- ✅ Maintain responsive grid layouts
- ✅ Use consistent card styling
- ✅ Show template counts in category cards

### **DON'T:**
- ❌ Show all templates on initial load
- ❌ Mix categories and templates in same view
- ❌ Remove the back navigation
- ❌ Show search bar in category view
- ❌ Break the two-level navigation pattern
- ❌ Change the card visual hierarchy

---

## 📱 Responsive Behavior

### **Mobile (< 768px)**
- Categories: 1 column grid
- Templates: 1 column grid
- Search bar: Full width, stacked layout
- Touch-friendly tap targets

### **Tablet (768px - 1024px)**
- Categories: 2 column grid
- Templates: 2 column grid
- Search and sort: Flex row layout

### **Desktop (> 1024px)**
- Categories: 3 column grid
- Templates: 3 column grid
- Full horizontal layout for controls

---

## 🔄 State Recovery

If the template gallery layout gets broken, restore by ensuring:

1. **View Mode State:** Default to 'categories'
2. **Category Selection:** Default to null
3. **Component Structure:** TemplateCategoryCard for categories, template cards for templates
4. **Navigation Logic:** handleCategoryClick and handleBackToCategories functions
5. **Conditional Rendering:** Show categories OR templates, never both
6. **Search Scope:** Only active in templates view

---

## 📝 File References

### **Main Component**
- `src/components/Templates/TemplateGallery.tsx`

### **Category Card Component**
- `src/components/Templates/TemplateCategoryCard.tsx`

### **Data Sources**
- `src/data/templates/categories/index.ts` (ALL_EXPANDED_TEMPLATES)
- `src/data/templates/categories/` (individual category files)

### **Type Definitions**
- `src/types/index.ts` (ChecklistTemplate, TemplateCategory)

---

## 🎯 Success Criteria

The template gallery is working correctly when:

1. ✅ Initial load shows 9 category cards
2. ✅ Clicking category shows templates for that category only
3. ✅ "Back to Categories" returns to category view
4. ✅ Search only works in templates view
5. ✅ Template selection creates functional checklists
6. ✅ No console errors or React hydration issues
7. ✅ Responsive design works on all screen sizes
8. ✅ Template counts are accurate per category

---

**End of Backup Documentation**

*This file serves as the definitive reference for the correct template gallery layout and should be consulted whenever layout issues arise.*
