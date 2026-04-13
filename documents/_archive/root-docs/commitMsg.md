# Git Commit Message Generator Prompt

Analyze the git changes (staged and unstaged) and generate a professional commit message following these best practices:

## Format: Conventional Commits

```
<type>(<scope>): <subject>

<body>

<footer>
```

## Rules

### 1. Type (Required)
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `style`: Changes that don't affect code meaning (formatting, whitespace)
- `docs`: Documentation only
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (dependencies, config, build)
- `ci`: CI/CD changes
- `revert`: Reverts a previous commit

### 2. Scope (Optional)
- Specify the affected area: `auth`, `ui`, `api`, `database`, `config`, etc.
- Use lowercase, no spaces

### 3. Subject (Required)
- Max 50 characters
- Start with lowercase verb (imperative mood): "add", "fix", "update", "remove"
- No period at the end
- Be specific and concise

### 4. Body (Optional but Recommended)
- Wrap at 72 characters
- Explain WHAT and WHY, not HOW
- Separate from subject with blank line
- Use bullet points for multiple changes

### 5. Footer (Optional)
- Breaking changes: `BREAKING CHANGE: description`
- Issue references: `Closes #123`, `Fixes #456`

## Examples

### Simple commit:
```
fix(auth): resolve login redirect loop
```

### With body:
```
feat(ui): add dark mode toggle to settings

- Add theme context provider
- Implement toggle switch component
- Store preference in localStorage
- Apply theme across all pages
```

### Breaking change:
```
refactor(api)!: restructure article API endpoints

BREAKING CHANGE: Article endpoints moved from /api/posts to /api/articles
Clients must update their API calls accordingly
```

## Semantic Versioning (REQUIRED)

Before generating the commit message, you MUST:

### 1. Read Current Version
- Read `modonty/package.json` and get current version

### 2. Determine Version Bump Type

**MAJOR** (X.0.0) - Breaking changes:
- API endpoint changes (URLs, response structure)
- Removing features or props
- Database schema breaking changes
- Changes requiring user migration

**MINOR** (x.X.0) - New features (backward compatible):
- New features, pages, or routes
- New API endpoints
- New components or functionality
- Feature enhancements

**PATCH** (x.x.X) - Bug fixes & small changes:
- Bug fixes
- Performance improvements
- UI/styling tweaks
- Documentation updates
- Refactoring (no behavior change)

**Note:** If commit contains mixed changes (e.g., new feature + bug fix), use the **highest priority** bump type:
- MAJOR > MINOR > PATCH
- Example: New feature + bug fix = MINOR bump

### 3. Update Package Version
- Calculate new version based on bump type
- Update `modonty/package.json` with new version
- Include version update in the commit

### 4. Create Git Tag
- After commit, create git tag: `git tag v{NEW_VERSION}`
- Example: `git tag v1.2.0`

---

## Task

Based on the current git diff:
1. **Read current version** from `modonty/package.json`
2. **Analyze changes** and determine version bump type (MAJOR/MINOR/PATCH)
3. **Calculate new version** number
4. **Update `modonty/package.json`** with new version
5. Identify all changed files and their purpose
6. Group related changes logically
7. Determine the primary type and scope
8. Generate a **single, final git command** in this EXACT format:

```
git add . && git commit -m "<type>(<scope>): <subject> (v{NEW_VERSION})" && git tag v{NEW_VERSION} && git push && git push --tags
```

**Example:**
```
git add . && git commit -m "refactor(ui): simplify navigation and seo (v1.9.2)" && git tag v1.9.2 && git push && git push --tags
```

### Output format (STRICT - COPY-PASTE READY)

- **You must output exactly ONE line with NO extra text before or after.**
- **Use `&&` to chain all commands together.**
- **Commit message format:** `<type>(<scope>): <subject> (v{NEW_VERSION})`
  - Include version in parentheses at the end of the commit message
  - Example: `"refactor(ui): simplify mobile menu (v1.9.2)"`
- **Command order (MANDATORY):**
  1. `git add .`
  2. `git commit -m "..."` (with version in message)
  3. `git tag v{NEW_VERSION}`
  4. `git push`
  5. `git push --tags`
- **Do NOT output any explanations, headers, bullet points, or extra text.**
- **Your entire response is ONLY the final command line ready to copy-paste.**