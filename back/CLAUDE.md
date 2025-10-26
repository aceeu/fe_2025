# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Node.js/Express backend server for a financial expense tracking application ("FE" - Family Expenses). It serves as the API backend for a React frontend application (located at `../fe-app/build`), providing authentication, data management, and category management for expense records.

## Core Architecture

### Main Application (`fe-server.js`)
The Express server that:
- Serves static files from the React frontend build folder
- Handles HTTP (port 8088) and HTTPS (port 8089) connections
- Implements token-based authentication with session management
- Routes all HTTP traffic to HTTPS (redirects to `aceeu.ru:8089`)
- All API endpoints return JSON responses

### Data Layer (`data.js`)
Contains all MongoDB data operations:
- `dataHandler(action)`: Higher-order function that wraps action handlers with session validation and error handling
- `fetchDataHandler()`: Retrieves expense records with date range filtering and category/buyer/product filters
- `fetchCategories()`: Returns non-archived categories from the categories collection
- Action handlers: `addRow`, `editRow`, `delRow` for CRUD operations on expense records
- `makeSummary(items)`: Aggregates expenses by category

### Authentication & Security
- Two-step authentication process:
  1. Client requests token via `/authtoken` endpoint
  2. Client sends SHA-256 hash of `password + token` to `/auth` endpoint
  3. Server compares with `SHA-256(stored_password + token)`
- Session-based authentication using `express-session` with 25-hour cookie lifetime
- User validation helper in `helpers.js` checks session against MongoDB users collection

### Database Schema (MongoDB)
Database name: `fe` (configured in `config.js`)

Collections:
- **users**: User authentication data (`user`, `password` fields)
- **data**: Expense records with fields:
  - `creator`, `buyer`, `category`, `buyDate`, `product`, `sum`, `whom`, `note`
  - Auto-generated: `created` (timestamp), `creator` (username), `edited`, `editor`
- **categories**: Category list with `archived` field (archived=1 items hidden from API)

### Configuration (`config.js`)
Centralized configuration for:
- MongoDB connection URL (default: `mongodb://localhost:27017`)
- Database name
- Frontend build folder path
- HTTP and HTTPS ports

## API Endpoints

### Authentication
- `GET /authtoken`: Get authentication token for current session
- `POST /auth`: Authenticate user with hash (expects `user` and `hash` in body)
- `GET /logout`: Clear session authentication
- `GET /user`: Get current authenticated user

### Data Operations
- `POST /data`: Fetch expense records (requires `fromDate`, `toDate`, optional `filter` object)
- `POST /adddata`: Add new expense record
- `POST /editdata`: Edit existing expense record
- `POST /deldata`: Delete expense record by `_id`
- `GET /categories`: Get list of non-archived categories

## Development Commands

### Start Server
```bash
node fe-server.js
```

### Import CSV Data
```bash
node import-csv.js
```
Imports expense data from `rashod.rashod2018.csv` (semicolon-delimited CSV)

### Export Database to JSON
```bash
node export-2json.js
```
Exports all expense records to `dump.js` (one JSON object per line)

### Generate Category Frequency List
```bash
node utilites.js
```
Analyzes all expenses, counts category usage frequency, and recreates the categories collection sorted by usage (WARNING: drops existing categories collection)

## Important Notes

- The MongoDB client connection is not explicitly closed in most handlers (relies on Node.js process cleanup)
- The `archived` field in categories collection should be `1` to hide a category from the selection menu
- Date filtering uses moment.js for date parsing and MongoDB date range queries (`$gte`, `$lt`)
- SSL certificate paths are commented out in `fe-server.js:118-122` - currently running without SSL certificates
- Token generator uses hardcoded salt in `fe-server.js:17`
- Filter validation only allows filtering by `buyer`, `category`, and `product` columns (see `validFilterColumns` in data.js:84)

## Recent Changes

- Added `archived` field support for categories to exclude them from menu display while preserving data integrity
