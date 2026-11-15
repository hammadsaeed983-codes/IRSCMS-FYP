# Intelligent Retail Supply Chain System — Inventory Module (v1.0 baseline)

A small MERN application for managing products and stock. This is an educational baseline for the Software Re-engineering assignment.

## Requirements
- Node.js 20+
- MongoDB Community Server running locally, or a MongoDB connection string
- npm

## Setup

1. Open a terminal in the project root.
2. Install root tools:
   ```bash
   npm install
   ```
3. Install client and server dependencies:
   ```bash
   npm run install:all
   ```
4. Create `server/.env`:
   ```env
   PORT=5000
   MONGO_URI= //give mongodb URI
   ```
5. Start both applications:
   ```bash
   npm run dev
   ```
6. Open http://localhost:5173

The API runs at http://localhost:5000/api/products.

## Main v1.0 scope
- Add, view, edit and delete products
- Search products
- Record stock received and stock sold
- Display current quantity and low-stock status

## Important: baseline deficiencies
This baseline is deliberately simple and should be treated as the version that will be reviewed before maintenance work. Do not silently fix everything before creating and documenting the maintenance issues. Test it, record reproducible observations, ask Claude Code to review it, create Trello maintenance cards, and then fix the selected issues in a separate maintenance pass.

Potential review areas include input validation, duplicate SKU handling, stock quantity rules, API error handling, deletion safeguards, access control, CORS configuration, and stock movement history. Confirm each issue through testing/code review before reporting it as a real deficiency.

## GitHub first release
After confirming the baseline runs:
```bash
git init
git add .
git commit -m "IRSC-1: Add inventory module v1.0 baseline"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
git tag v1.0
git push origin v1.0
```
Replace `IRSC-1` with a real Trello-card reference or agreed project key. Trello does not automatically provide Jira issue keys; agree on a short key convention with your instructor/team and use it consistently in commits.
