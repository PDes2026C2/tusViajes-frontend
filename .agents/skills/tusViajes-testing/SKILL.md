---
name: tusViajes-testing
description: >
  Standard rules and patterns for unit testing the TusViajes web application using Vitest and React Testing Library.
  Apply this skill whenever creating new UI components, hooks with logic, or when explicitly asked to add unit tests to the project.
  It ensures consistency in testing structure (AAA), mocking strategy, and selective testing of logic-heavy entities.
---

# TusViajes Testing Standards

This skill defines the mandatory patterns for unit testing within the TusViajes project. We prioritize fast, isolated unit tests that verify business logic and user interactions.

## 1. Scope of Testing

- **UI Components (`components/`)**: Test presentational components to ensure they render correctly based on props and trigger callbacks on interaction.
- **Hooks with Logic (`hooks/`)**: Test hooks that implement form handling, error state management, or complex effects.
- **Do NOT test**: Simple hooks that only act as proxies for a store without adding additional mapping or state logic.

## 2. Test Structure: AAA (Arrange, Act, Assert)

All tests must be structured into three distinct parts, separated by comments with their respective names:

1.  **Arrange**: Set up the component/hook, props, any necessary mocks, and **expected entities/models**.
    - Internal ordering:
        1. **Entities**: Define local inputs or temporary data needed for the test.
        2. **Expected States**: Define the **semantic expected state** (e.g., `expectedAuthState`, `expectedWorkbenchState`).
        3. **Mocking**: Configure mock behaviors or return values (e.g., `vi.mocked(...).mockResolvedValue(...)`).
2.  **Act**: Execute the action being tested (rendering, clicking, calling a function).
3.  **Assert**: Verify the expected outcome.

### Rule: Full Value Comparison
Whenever possible, compare **full objects or types** instead of individual fields.
- Define the **expected entity** in the **Arrange** section using a semantic name.
- If you expect a specific state or object, create an instance of that entity and compare it using `toEqual`.
- This ensures that any unexpected fields or missing data are caught in the test.

**Rule**: Do not use any other comments to explain the test; the test names and the AAA structure must be expressive enough.

### Component Example
```typescript
it('calls onAction when button is clicked', () => {
  // arrange
  const onAction = vi.fn()
  render(<MyComponent onAction={onAction} />)
  const button = screen.getByRole('button')

  // act
  fireEvent.click(button)

  // assert
  expect(onAction).toHaveBeenCalled()
})
```

### Hook Example (Full Equality)
```typescript
it('maps the data to the correct domain model', () => {
  // arrange
  const rawData = { id: 1, name: 'Test' }
  const expectedModel = { id: 1, label: 'Test', isActive: true } // Complete instance
  const { result } = renderHook(() => useMyHook())

  // act
  const model = result.current.transform(rawData)

  // assert
  expect(model).toEqual(expectedModel) // Compare full value
})
```

## 3. Mocking Strategy

- **Network Calls**: Always mock network calls. Use `vi.mock` for stores/datasources or MSW for global interceptors.
- **Stores**: Mock Zustand stores in hook tests to isolate the hook's logic from store implementations.
- **External Libraries**: Mock complex libraries (like `react-hook-form` in unit tests) if you only want to test the glue logic of the hook.

## 4. Setup & Initialization

- **Shared Entities**: To keep the **Arrange** section concise and expressive, move common entities, default props, and mock setups to the `beforeEach` block.
- **Descriptive Naming**: Use highly descriptive names for shared entities to provide context (e.g., `unregisteredUserCredentials`, `emptyWorkspace`, `mockAdminUser`) instead of generic names.
- Define shared variables at the `describe` scope and reset/initialize them in `beforeEach` so they are fresh for every test.

## 5. Environment & Tools

- **Runner**: Vitest.
- **Library**: React Testing Library (RTL).
- **Environment**: `jsdom` (already configured in `vite.config.ts`).
- **Global Setup**: Initialized in `src/tests/setup.ts`.