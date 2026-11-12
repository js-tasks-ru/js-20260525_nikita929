# SortableList

Необходимо реализовать "SortableList" компонент - цель которого позволить перемещать элементы 
списка с помощью [Drag'n'Drop](https://learn.javascript.ru/mouse-drag-and-drop).

!["SortableTable v3"](sortable-list.gif)

В проекте данный компонент будет использоваться на страницах:
* [Категории](https://course-js.javascript.ru/categories)
* [Товары](https://course-js.javascript.ru/products/101-planset-lenovo-tab-e10-tb-x104l-32-gb-3g-lte-cernyj)

Компонент должен принимать массив DOM элементов и отображать его в виде списка на странице.

Дополнительно, "SortableList" компонент должен обладать функционалом удаления элементов из отображаемого
списка. 

Зона с помощью которой можно "захватить" элемент для перемещения должна быть помечена data-атрибутом
"data-grab-handle"

Зона с помощью которой можно удалить элемент должна быть помечена data-атрибутом "data-delete-handle"

## Требования к реализации

Работа ведется в файле `src/index.ts`.

### 1. Интерфейс класса

```typescript
new SortableList({ items })
```

* **items**: массив DOM-элементов списка.

### 2. Публичные свойства

* `element`: корневой DOM-элемент списка (`<ul>`).

### 3. Методы

* `remove()`: удаляет список из DOM и снимает обработчики.
* `destroy()`: удаляет компонент.

## Инструкция по запуску

**Запуск в режиме разработки:**
```bash
npm run dev:09:2-sortable-list
```

**Запуск тестов:**
```bash
npm test 09-tests-for-frontend-apps/2-sortable-list
```
