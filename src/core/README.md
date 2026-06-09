# Karya Core Library

Core library components, hooks, and utilities for Karya applications built with React and DevExtreme.

## Installation

```bash
npm install @karya/core
```

## Usage

### Main Entry Point
```typescript
import { BaseFormPage, BaseListPage, BaseCustomPage } from '@karya/core';
```

### Components
```typescript
import { AppForm, AppDatagrid, AppFormDetail } from '@karya/core/components';
```

### Contexts
```typescript
import { useAppFormContext, useAppListContext } from '@karya/core/contexts';
```

### Hooks
```typescript
import { useAppFormDatasource, useAppDatagridDatasouce } from '@karya/core/hooks';
```

### Layouts
```typescript
import { PageLayout, PageFormLayout, PageListLayout } from '@karya/core/layouts';
```

### Services
```typescript
import { ApiRequest } from '@karya/core/services';
```

## Peer Dependencies

- `react` >= 18.0.0
- `react-dom` >= 18.0.0
- `react-router-dom` >= 6.0.0
- `devextreme` >= 24.0.0
- `devextreme-react` >= 24.0.0

## License

MIT
