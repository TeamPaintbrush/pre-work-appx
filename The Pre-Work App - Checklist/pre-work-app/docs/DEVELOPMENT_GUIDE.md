# 🔧 Development Guide - Pre-Work App

## Overview
This guide covers development workflows, coding standards, and best practices for contributing to the Pre-Work App.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git
- AWS CLI (for backend features)
- VS Code (recommended)

### Initial Setup
```bash
# Clone the repository
git clone <repository-url>
cd pre-work-app

# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local

# Configure AWS (if working with backend)
aws configure

# Create AWS resources
./setup-aws-resources.sh  # or setup-aws-resources.ps1 on Windows

# Start development server
npm run dev
```

---

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   ├── profile/        # Profile pages
│   ├── settings/       # Settings pages
│   └── templates/      # Template pages
├── components/         # React components (organized by feature)
├── lib/               # Utility functions and configurations
│   ├── database/      # Database utilities and schemas
│   ├── aws/          # AWS service integrations
│   └── utils/        # General utilities
├── hooks/            # Custom React hooks
├── types/            # TypeScript type definitions
└── data/             # Static data and configurations
```

---

## 🛠️ Development Workflow

### Branch Strategy
- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - Feature development branches
- `hotfix/*` - Critical bug fixes

### Feature Development
1. **Create feature branch**
   ```bash
   git checkout -b feature/user-profile-enhancement
   ```

2. **Development cycle**
   ```bash
   # Start development server
   npm run dev
   
   # Run tests in watch mode
   npm run test:watch
   
   # Type checking
   npm run type-check
   ```

3. **Code quality checks**
   ```bash
   # Linting
   npm run lint
   
   # Formatting
   npm run format
   
   # Full check before commit
   npm run pre-commit
   ```

4. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: add user profile customization"
   git push origin feature/user-profile-enhancement
   ```

---

## 📋 Coding Standards

### TypeScript Guidelines

1. **Use strict types**
   ```typescript
   // Good
   interface User {
     id: string;
     email: string;
     name: string;
     role: 'admin' | 'manager' | 'user';
   }
   
   // Avoid
   interface User {
     id: any;
     email: string;
     name?: string;
   }
   ```

2. **Export types and interfaces**
   ```typescript
   // types/user.ts
   export interface User {
     id: string;
     email: string;
     name: string;
   }
   
   export type UserRole = 'admin' | 'manager' | 'user';
   ```

3. **Use utility types**
   ```typescript
   // Good
   type CreateUserRequest = Omit<User, 'id' | 'createdAt'>;
   type UpdateUserRequest = Partial<Pick<User, 'name' | 'email'>>;
   ```

### React Component Guidelines

1. **Functional components with TypeScript**
   ```typescript
   interface Props {
     title: string;
     onClose: () => void;
     children?: React.ReactNode;
   }
   
   export function Modal({ title, onClose, children }: Props) {
     return (
       <div className="modal">
         <h2>{title}</h2>
         {children}
         <button onClick={onClose}>Close</button>
       </div>
     );
   }
   ```

2. **Custom hooks**
   ```typescript
   export function useUser(userId: string) {
     const [user, setUser] = useState<User | null>(null);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);
   
     useEffect(() => {
       fetchUser(userId)
         .then(setUser)
         .catch((err) => setError(err.message))
         .finally(() => setLoading(false));
     }, [userId]);
   
     return { user, loading, error };
   }
   ```

3. **Component organization**
   ```typescript
   // ComponentName/
   // ├── index.ts          # Export barrel
   // ├── ComponentName.tsx # Main component
   // ├── types.ts         # Component-specific types
   // └── utils.ts         # Component-specific utilities
   ```

### CSS and Styling

1. **Tailwind CSS classes**
   ```tsx
   // Use semantic class combinations
   <div className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm">
     <h3 className="text-lg font-semibold text-gray-900">Title</h3>
     <button className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800">
       Action
     </button>
   </div>
   ```

2. **Responsive design**
   ```tsx
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
     {/* Content */}
   </div>
   ```

3. **CSS custom properties for themes**
   ```css
   :root {
     --color-primary: theme('colors.blue.600');
     --color-primary-hover: theme('colors.blue.700');
     --spacing-section: theme('spacing.16');
   }
   ```

---

## 🧪 Testing Guidelines

### Unit Testing
```typescript
// __tests__/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/UI/Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Testing
```typescript
// __tests__/api/users.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '@/app/api/users/route';

describe('/api/users', () => {
  it('creates a new user', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    const data = JSON.parse(res._getData());
    expect(data.user.email).toBe('test@example.com');
  });
});
```

### E2E Testing (Playwright)
```typescript
// e2e/user-profile.spec.ts
import { test, expect } from '@playwright/test';

test('user can update their profile', async ({ page }) => {
  await page.goto('/profile');
  
  await page.fill('[data-testid="name-input"]', 'New Name');
  await page.click('[data-testid="save-button"]');
  
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
});
```

---

## 🔧 Development Tools

### VS Code Extensions
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "ms-playwright.playwright"
  ]
}
```

### ESLint Configuration
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'next/core-web-vitals',
    '@typescript-eslint/recommended',
    'prettier',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    'react-hooks/exhaustive-deps': 'error',
  },
};
```

### Prettier Configuration
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

---

## 🐛 Debugging

### Next.js Debugging
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    }
  ]
}
```

### React DevTools
- Install React Developer Tools browser extension
- Use component tree for state inspection
- Profile performance with React Profiler

### AWS Debugging
```typescript
// Enable AWS SDK debug logging
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  logger: console, // Enable logging
});
```

---

## 📊 Performance Guidelines

### Code Splitting
```typescript
// Dynamic imports for large components
import dynamic from 'next/dynamic';

const ChartComponent = dynamic(() => import('./ChartComponent'), {
  loading: () => <Skeleton height="h-64" />,
  ssr: false,
});
```

### Image Optimization
```tsx
import Image from 'next/image';

// Use Next.js Image component
<Image
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### Database Optimization
```typescript
// Use pagination for large datasets
export async function getUsers(limit = 20, lastKey?: string) {
  const params = {
    TableName: 'users',
    Limit: limit,
    ...(lastKey && { ExclusiveStartKey: { id: { S: lastKey } } }),
  };
  
  return dynamodb.scan(params);
}
```

---

## 🔒 Security Best Practices

### Input Validation
```typescript
import { z } from 'zod';

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  role: z.enum(['admin', 'manager', 'user']),
});

export async function createUser(data: unknown) {
  const validatedData = CreateUserSchema.parse(data);
  // Proceed with validated data
}
```

### Environment Variables
```typescript
// Validate environment variables at startup
const envSchema = z.object({
  AWS_REGION: z.string(),
  DYNAMODB_USERS_TABLE: z.string(),
  NEXTAUTH_SECRET: z.string().min(32),
});

export const env = envSchema.parse(process.env);
```

---

## 📚 Additional Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/)

### Community
- [Next.js GitHub](https://github.com/vercel/next.js)
- [React Community](https://reactjs.org/community/support.html)
- [TypeScript Community](https://www.typescriptlang.org/community/)

### Tools
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [AWS CLI](https://aws.amazon.com/cli/)
- [Postman](https://www.postman.com/) for API testing
