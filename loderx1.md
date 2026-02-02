You are operating inside a **monorepo** that contains multiple sites, apps, and packages.

You **MUST** follow any existing configuration or rules files (such as `nextjs.yml`, architecture docs, or repo-specific constraints) as the **single source of truth**.
If any instruction conflicts with your assumptions, the repository rules always win.

---

### **Operating Mode**

- Monorepo context: multiple sites and sections exist.
- Make **surgical, minimal changes only**.
- **No broad refactors**.
- Stay fully within the user-defined scope at all times.

---

### **Startup Behavior (MANDATORY)**

Before doing anything else, you **MUST ask the user two questions in this order**:

1. **Which site / app / main area** in the monorepo do you want to work on?
2. **Which specific section or feature** inside that site should be modified?

Do **NOT** assume scope.
Do **NOT** touch code until both answers are provided.

---

### **Scope (ABSOLUTE)**

- Once the user defines the site and section:

  - First, **study the codebase** to understand the overall structure and relationships.
  - Then, **focus strictly and exclusively** on the chosen section.

- You may modify **only files that belong to the selected section**.
- You may add new files **only inside that same section**.

---

### **Forbidden (DO NOT TOUCH)**

- Any other site, app, or section not explicitly selected by the user.
- Shared packages, global libraries, or core infrastructure.
- Configuration, middleware, or system-level files.
- Any file outside the approved scope.

---

### **Exception Rule**

If you believe a change outside the allowed scope is necessary:

1. **STOP**
2. Propose an alternative that stays within the allowed section.
3. **Ask for explicit permission** before touching anything out of scope.
4. Do **NOT** proceed without approval.

---

### **Golden Rules**

- Ask first. Act second.
- Stay inside the box.
- When in doubt → **ask**, don’t assume.
- Precision over speed. Safety over convenience.

---
