# Roadmap Elements

Эта папка содержит компоненты для роадмапа.

## Структура

- `README.md` - этот файл с инструкциями
- `index.ts` - экспорт всех компонентов (будет создан)

## Как добавлять новые компоненты

1. Создайте новый файл с компонентом (например, `MyComponent.tsx`)
2. Добавьте экспорт в `index.ts`
3. Импортируйте в `GameMapSVG.tsx`

## Пример компонента

```tsx
import React from 'react';

interface MyComponentProps {
  x: number;
  y: number;
  // другие пропсы
}

const MyComponent: React.FC<MyComponentProps> = ({ x, y }) => {
  return (
    <g>
      {/* SVG элементы */}
    </g>
  );
};

export default MyComponent;
```

## Интеграция в GameMapSVG

```tsx
import { MyComponent } from './roadmap-elements';

// В JSX:
<MyComponent x={100} y={100} />
```
