# i18n: Internationalization Workflow

Always follow this when adding new user-facing text to any component or view.

## 1. Add the key to `dictionary.ts`

Open `frontend/src/i18n/dictionary.ts` and add the new key in the appropriate section:

```typescript
export interface Dictionary {
  // Find existing section or create a new one
  mySection: {
    myKey: string;
  };
}
```

## 2. Add translations to all 4 language files

Update all four files:

| File | Language |
|------|----------|
| `frontend/src/i18n/dictionaries/es.ts` | Spanish |
| `frontend/src/i18n/dictionaries/en.ts` | English |
| `frontend/src/i18n/dictionaries/pt.ts` | Portuguese |
| `frontend/src/i18n/dictionaries/fr.ts` | French |

## 3. Use `t()` in the component

### For Client Components (`'use client'`):

```tsx
import { useTranslation } from '@/i18n/I18nProvider';

export function MyComponent() {
  const { t } = useTranslation();
  return <p>{t('mySection.myKey')}</p>;
}
```

### For Server Components:

Client components only — `useTranslation` uses React context and cannot be used in server components.

## 4. Dynamic segments

For dynamic values inside translations (e.g. "Service XYZ123 created"), keep the variable outside the `t()` call:

```tsx
// GOOD - static part translated, dynamic part separate
<p>{t('admin.messages.serviceCreated')}: {data.codigoServicio}</p>

// BAD - don't concatenate dynamic values inside the translation
<p>{t('admin.messages.serviceCreated') + data.codigoServicio}</p>
```

## 5. Role-based keys

Use dot notation with template literals for dynamic role keys:

```tsx
{t(`roles.${role}`)}  // resolves to roles.admin, roles.tecnico, etc.
{t('kanban.' + servicio.estado)}  // resolves to kanban.pendiente, etc.
```

## 6. Verify

After adding translations, verify TypeScript:

```powershell
cd frontend
npx tsc --noEmit
```

The `Dictionary` type ensures all keys exist across all languages.
