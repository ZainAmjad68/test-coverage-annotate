# Test Coverage Annotate - GitHub Action

This action Scans the Changes in a PR and then uses the provided Coverage Report to display Annotations about the uncovered parts of the code

## Inputs

### `token`

**Required** The Token required to access the Pull Request (PR) using GitHub APIs

### `coverage-info-path`

**Optional** Path of the Coverage Report
**Default** './coverage/lcov.info'

### `annotation-type`

**Optional** Specifies whether the Coverage Annotations should be displayed on top of each file as a Summary (`summarize`) or in-line ((`detailed`))
**Default** 'summarize'

### `annotation-coverage`

**Optional** Aspects of the Coverage Report to Annotate. These can be lines/functions/branches
**Default** 'all'

## Example usage

```yaml
uses: ZainAmjad68/test-coverage-annotate@0.8
with:
  token: ${{ secrets.GITHUB_TOKEN }}
```
