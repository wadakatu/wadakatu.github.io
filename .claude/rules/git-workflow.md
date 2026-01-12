# Git Workflow Rules

## Branch Naming

Use descriptive branch names with issue reference:
- `feature/issue-{number}-{description}`
- `fix/issue-{number}-{description}`
- `chore/issue-{number}-{description}`

Examples:
- `feature/issue-92-security-headers`
- `fix/issue-96-matrix-rain-speed`

## Commit Messages

Follow conventional commits format:

```
<type>: <description>

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `perf`: Performance improvement
- `a11y`: Accessibility improvement
- `security`: Security improvement
- `chore`: Maintenance tasks
- `docs`: Documentation

## Pull Requests

- Reference the issue number in PR title or body
- Use `Closes #XX` to auto-close issues
- Include summary of changes
- Add test plan when applicable
