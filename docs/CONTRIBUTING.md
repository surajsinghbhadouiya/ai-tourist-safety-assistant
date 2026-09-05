# Contributing to AI Tourist Safety Assistant

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

Please be respectful and inclusive when contributing. Treat all contributors with courtesy.

## How to Contribute

### 1. Fork the Repository
```bash
git clone https://github.com/yourusername/ai-tourist-safety-assistant.git
cd ai-tourist-safety-assistant
```

### 2. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 3. Make Your Changes
- Follow the coding standards (see below)
- Write clear, descriptive commit messages
- Add tests for new functionality
- Update documentation as needed

### 4. Commit Your Changes
```bash
git add .
git commit -m "feat: Add feature description"
```

Use conventional commits:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation
- `style:` for code style changes
- `refactor:` for refactoring
- `test:` for tests
- `chore:` for maintenance

### 5. Push to Your Fork
```bash
git push origin feature/your-feature-name
```

### 6. Create a Pull Request
- Provide a clear description of the changes
- Link related issues
- Ensure all tests pass
- Wait for review and address feedback

## Coding Standards

### JavaScript/Node.js
- Use ES6+ syntax
- Use async/await instead of callbacks
- Use meaningful variable names
- Add JSDoc comments for functions
- Use 2-space indentation
- Follow ESLint rules

### React/Frontend
- Use functional components with hooks
- Keep components small and focused
- Use PropTypes or TypeScript for prop validation
- Use meaningful component names
- Organize components in feature folders

### Git Workflow
- Keep commits atomic and focused
- Write descriptive commit messages
- Rebase before pushing
- Don't commit sensitive information

## Testing

- Write unit tests for new features
- Ensure all tests pass before submitting
- Aim for >80% code coverage
- Test edge cases

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## Documentation

- Update README.md if you change functionality
- Add comments for complex logic
- Update API documentation if needed
- Include examples for new features

## Pull Request Process

1. Update the README.md with details of significant changes
2. Ensure the PR description clearly describes the problem and solution
3. Link any related issues
4. Ensure all checks pass
5. Request review from maintainers

## Issues

- Check if the issue already exists
- Provide clear description and steps to reproduce
- Include relevant error messages
- Specify your environment (OS, Node version, etc.)

## Questions?

Open an issue with the question tag or reach out to the maintainers.

Happy coding!
