# Rule 06: Tailwind Plus UI Component Library Standards

## 1. Component Architecture
All UI components live in `resources/js/Components/` structured into clean atomic groups matching Tailwind Plus UI Blocks standards:
```text
resources/js/Components/
├── UI/
│   ├── Elements/       # Button, Badge, Avatar, Dropdown, ButtonGroup
│   ├── Forms/          # Input, Select, Checkbox, Radio, Toggle, Textarea, FormGroup
│   ├── Navigation/     # Navbar, Sidebar, Tabs, Breadcrumbs, Pagination
│   ├── DataDisplay/    # Table, StatsCard, DescriptionList, EmptyState, RankBadge
│   ├── Feedback/       # Alert, Toast, LoadingSpinner
│   ├── Overlays/       # Modal, ConfirmDialog, Drawer, Popover
│   └── Layout/         # Container, Card, SectionHeading, PageHeading
├── Domain/             # Dojo & Kenshi specific composite widgets (KenshiCard, DojoMap, UKTScoreSheet)
└── Layouts/            # AppLayout, GuestLayout, AuthLayout
```

## 2. Component Guidelines & TypeScript Standards
- **Strong Typing**: Every component must declare a TypeScript interface extending native HTML attributes:
  ```tsx
  export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
      variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
      size?: 'sm' | 'md' | 'lg';
      isLoading?: boolean;
      leftIcon?: React.ReactNode;
      rightIcon?: React.ReactNode;
  }
  ```
- **Utility Merging (`cn`)**: All class combinations must use `clsx` and `tailwind-merge` via `resources/js/lib/utils.ts` to avoid Tailwind class conflicts:
  ```tsx
  import { cn } from '@/lib/utils';
  <button className={cn('base-classes', variants[variant], sizes[size], className)} {...props}>
  ```
- **Forwarding Refs**: Base primitive components (Button, Input, Select) must support `React.forwardRef` to ensure compatibility with form libraries, tooltips, and focus managers.

## 3. Tailwind Plus UI Blocks Categories
1. **Elements**:
   - `Button`: Multiple variants (primary/vermilion, secondary/slate, outline, ghost, danger), loading states with SVG spinner.
   - `Badge`: Status badges (active, pending, suspended, Dan rank) with dot indicators.
   - `Avatar`: Fallback initials, size scale (xs to xl), active status ring.
   - `Dropdown`: Keyboard accessible, click-outside dismissal, smooth scale-in animation.
2. **Forms**:
   - Consistent error message display, label integration, helper text, disabled states, and invalid ring highlighting.
   - Seamless Inertia Form helper integration (`useForm()`).
3. **Navigation**:
   - Responsive sidebar with collapse toggle, active route highlighting using `route().current()`.
   - Accessible pagination with page numbers, prev/next, and total counts.
4. **Data Display**:
   - Responsive tables with sorting headers, empty state integration, and row actions.
   - Stats cards with trends (+/- indicators), icons, and subtitle metrics.
5. **Feedback & Overlays**:
   - Modal and Dialog powered by Headless UI or Framer Motion backdrop transitions with ESC key listeners and focus trapping.
   - Accessible Alert banners with status icons (Info, Success, Warning, Error).
