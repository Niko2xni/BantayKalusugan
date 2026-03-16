# 🚀 Frontend Styling Guide: Moving to CSS Modules

## ⚠️ Why did we change this?
Previously, we used standard global CSS (e.g., `import './style.css'`). Because Vite bundles all standard CSS globally, we experienced a **"CSS Bleeding"** issue where styles from the public `landing_page.jsx` were accidentally leaking into and breaking the layout of the `AdminDashboard.jsx`. 

To fix this and guarantee that our component styles remain safely isolated, we have completely migrated the frontend to use **CSS Modules**.

---

## 🛠️ The New CSS Workflow

Writing the actual CSS rules (Flexbox, Grid, colors) is exactly the same! The only things that change are how we **name the files**, **write the class names**, and **apply them in React**.

### 1. File Naming
All component-specific CSS files **must** end with `.module.css`. If you forget the `.module` part, Vite will treat it as global CSS and it might break other pages!
* ❌ Bad: `PatientCard.css`
* ✅ Good: `PatientCard.module.css`

### 2. Writing CSS (Use camelCase!)
When writing classes inside your new module file, it is highly recommended to use `camelCase` instead of dashes (`kebab-case`). This makes it much easier to access them as JavaScript properties later.

```css
/* PatientCard.module.css */

/* ❌ Avoid dashes if possible */
.submit-btn { 
  /* works, but annoying to type in JS */ 
} 

/* ✅ Use camelCase */
.submitBtn {
  background-color: #0056b3;
  border-radius: 8px;
}
```

### 3. Importing the CSS into React
Instead of importing the file directly, you now import it as a JavaScript object (usually named `styles` or `classes`).

```jsx
// ❌ Old way (Global)
import './PatientCard.css';

// ✅ New way (Scoped)
import styles from './PatientCard.module.css';
```

### 4. Applying Classes in JSX
You no longer pass a plain string to the `className` attribute. Instead, you open curly braces `{}` and call the specific class from your `styles` object.

**Applying a single class:**
```jsx
// ❌ Old way
<button className="submitBtn">Save</button>

// ✅ New way
<button className={styles.submitBtn}>Save</button>
```

**Applying multiple classes:**
If you need to apply more than one class, use a JavaScript template literal (backticks):
```jsx
<div className={`${styles.cardContainer} ${styles.highlighted}`}>
```

**Applying classes conditionally:**
```jsx
<div className={`${styles.statusBadge} ${isCritical ? styles.redText : ''}`}>
```

### 💡 The Escape Hatch: Styling Global HTML Tags
Because CSS Modules automatically scramble your class names to protect them, you might wonder how to style a standard HTML tag (like `<h1>` or `body`) inside a module file without it getting scrambled. Just wrap it in `:global()`!

```css
/* AdminDashboard.module.css */
.adminContainer :global(h1) {
  font-size: 24px;
  color: #333;
}
```

*If you run into any layout issues or have questions about applying styles to your new components, just let me know!*