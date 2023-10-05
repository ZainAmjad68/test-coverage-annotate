# Test Coverage Annotate - GitHub Action

A GitHub Action that enhances your code review process by providing visual insights into test coverage directly on your pull requests.

<p align="center">
  <img width="739" alt="test-coverage-annotate" src="https://github.com/ZainAmjad68/test-coverage-annotate/assets/53145353/dd63374d-9251-4010-817d-c0eb17f4875d">
</p>

## :mag: Overview

Test Coverage Annotate is a powerful GitHub Action that scans the changes in a pull request and utilizes the provided coverage report to display annotations on the PR, highlighting uncovered parts of the code. This allows developers and reviewers to quickly identify areas with insufficient test coverage and take appropriate actions.

## :bulb: Features

- Seamlessly integrates into your pull request workflow.
- Provides actionable insights into code coverage.
- Customizable annotation style: choose between summarized or detailed annotations.
- Flexible annotation types: focus on lines, functions, or branches that need attention.
- Easy-to-use configuration with sensible defaults.

## :gear: Configuration

### Inputs

### `token` (required)

The access token required to interact with the GitHub API for fetching pull request details.

### `coverage-info-path` (optional)

The path to the coverage report file. This defaults to './coverage/lcov.info'.

### `annotation-coverage` (optional)

Specifies the style of coverage annotations to display:
- `summarize`: Show a summary annotation on each file.
- `detailed`: Display line-level annotations directly in the code.

Defaults to 'summarize'.

### `annotation-type` (optional)

The type of coverage aspects to annotate:
- `lines`: Annotate uncovered lines.
- `functions`: Annotate uncovered functions.
- `branches`: Annotate uncovered branches.
- `all`: Annotate all of the above aspects.

Defaults to 'all'.

## :rocket: Example Usage

```yaml
uses: your-username/test-coverage-annotate@v0.8
with:
  token: ${{ secrets.GITHUB_TOKEN }}
  coverage-info-path: './coverage/lcov.info'
  annotation-coverage: 'detailed'
  annotation-type: 'all'
```
