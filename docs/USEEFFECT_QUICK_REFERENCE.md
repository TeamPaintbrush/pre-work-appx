# 🚨 useEffect Quick Reference - Prevent Infinite Loops

## ❌ DANGER PATTERNS

```typescript
// 🚨 INFINITE LOOP - No dependency array
useEffect(() => {
  setState(value);
});

// 🚨 INFINITE LOOP - Object dependency changes every render
const config = { prop: value };
useEffect(() => {
  doSomething(config);
}, [config]);

// 🚨 INFINITE LOOP - Function dependency recreated every render
const handler = () => doSomething();
useEffect(() => {
  handler();
}, [handler]);
```

## ✅ SAFE PATTERNS

```typescript
// ✅ Run once on mount
useEffect(() => {
  setState(value);
}, []);

// ✅ Stable dependencies
useEffect(() => {
  doSomething({ prop: value });
}, [value]);

// ✅ Memoized function
const handler = useCallback(() => doSomething(), []);
useEffect(() => {
  handler();
}, [handler]);
```

## 🔍 QUICK DEBUG

```typescript
// Add this to suspect components:
useEffect(() => {
  console.log('🔄 Component rendered');
}); // Should only log once per intended render
```

## 📋 CHECKLIST

Before committing:
- [ ] All useEffect have dependency arrays
- [ ] No setState without proper deps
- [ ] Objects/arrays are stable
- [ ] Functions use useCallback

**Remember: When in doubt, add the dependency array!**
