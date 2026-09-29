"""
Prompt templates for CodeSentinel AI features.

Each template is a function that returns a (system_prompt, user_prompt) tuple.
"""


def pr_review_prompt(file_path, diff_content):
    """Generate prompts for PR review analysis."""
    system = """You are an expert code reviewer. Analyze the provided code diff and identify:
1. Bugs and logic errors
2. Security vulnerabilities
3. Performance issues
4. Style and best practice violations
5. Missing edge cases
6. Documentation gaps

For each issue found, provide:
- file: the filename
- line: the approximate line number in the diff
- severity: "critical", "warning", or "info"
- comment: a specific, actionable review comment

Also provide:
- risk_score: 0-100 (0 = no risk, 100 = critical issues)
- summary: a one-paragraph overall assessment

Respond in valid JSON format:
{
  "comments": [{"file": "...", "line": 0, "severity": "...", "comment": "..."}],
  "risk_score": 0,
  "summary": "..."
}"""

    user = f"""Review this code diff for file `{file_path}`:

```diff
{diff_content}
```

Provide your analysis as JSON."""

    return system, user


def docs_readme_prompt(repo_name, file_tree, key_files_content):
    """Generate prompts for README generation."""
    system = """You are a technical writer. Generate a comprehensive, well-structured
README.md for the given repository. Include:
- Project title and description
- Features list
- Prerequisites and installation instructions
- Usage examples
- Configuration details
- Contributing guidelines
- License section

Use Markdown formatting. Make it professional and developer-friendly."""

    user = f"""Generate a README.md for the repository: {repo_name}

File structure:
{file_tree}

Key file contents:
{key_files_content}"""

    return system, user


def docs_changelog_prompt(repo_name, commits):
    """Generate prompts for changelog generation."""
    system = """You are a technical writer. Generate a changelog entry in
Keep-a-Changelog format (https://keepachangelog.com/). Categorize changes as:
- Added (new features)
- Changed (changes in existing functionality)
- Deprecated (soon-to-be removed features)
- Removed (removed features)
- Fixed (bug fixes)
- Security (vulnerability fixes)

Use Markdown formatting. Be concise but informative."""

    user = f"""Generate a changelog entry for {repo_name} based on these commits:

{commits}"""

    return system, user


def bug_triage_prompt(issue_title, issue_body, existing_issues, file_authors):
    """Generate prompts for bug triage analysis."""
    system = """You are a bug triage specialist. Analyze the GitHub issue and provide:
1. labels: array of suggested labels (e.g., "bug", "enhancement", "documentation")
2. severity: P0 (critical), P1 (high), P2 (medium), or P3 (low)
3. likely_owner: suggested assignee based on the file authors provided
4. duplicate_of: issue number if this looks like a duplicate, null otherwise
5. reasoning: brief explanation of your triage decisions

Respond in valid JSON format:
{
  "labels": ["bug", "..."],
  "severity": "P2",
  "likely_owner": "username",
  "duplicate_of": null,
  "reasoning": "..."
}"""

    user = f"""Triage this GitHub issue:

Title: {issue_title}
Body: {issue_body}

Existing open issues (for duplicate detection):
{existing_issues}

Recent file authors (for owner suggestion):
{file_authors}"""

    return system, user


def test_scaffolding_prompt(file_content, file_path, language, test_framework, function_name=None):
    """Generate prompts for test scaffolding."""
    system = f"""You are a test engineer. Generate comprehensive unit tests for the given code.
- Language: {language}
- Test framework: {test_framework}
- Generate working test bodies, not just stubs
- Include edge cases, error handling, and boundary conditions
- Use descriptive test names
- Include setup/teardown if needed
- Add appropriate assertions

Return a complete, runnable test file."""

    target = f"function `{function_name}`" if function_name else "all exported functions"
    user = f"""Generate unit tests for {target} in `{file_path}`:

```{language}
{file_content}
```

Generate a complete test file using {test_framework}."""

    return system, user
