# Downloads Directory

Place your `.vsix` files in this directory. The system will automatically detect the latest version based on the filename.

## Filename Format
Files should follow this naming convention:
```
codersinflow-X.X.X.vsix
```

Where X.X.X is the version number (e.g., `codersinflow-0.0.695.vsix`)

## How it Works
1. The PHP script scans this directory for all `.vsix` files
2. It extracts the version number from each filename
3. It automatically serves the file with the highest version number
4. No manual updates needed - just upload new files!

## Example
If you have these files:
- codersinflow-0.0.693.vsix
- codersinflow-0.0.694.vsix
- codersinflow-0.0.695.vsix

The system will automatically serve `codersinflow-0.0.695.vsix` as the latest version.