# Campus Lost & Found Management System — Phase 1

A simple full-stack student project using Node.js, Express.js, EJS, MongoDB and Mongoose.

## Phase 1 features
- Create student profiles and view one profile by MongoDB ID.
- Create, list and view lost-item reports.
- Search lost reports by item name, category or last-seen location.
- Create, list and view found-item reports.
- Store student/item relationships using MongoDB ObjectId references.
- Validate required fields, email format, duplicate student email, invalid IDs and missing records.
- Display empty states and error pages.

Claims, approval/rejection and the return workflow are Phase 2 features and are not implemented here.

## Requirements
- Node.js and npm
- MongoDB Community Server running locally, or a MongoDB Atlas connection string

## Setup in VS Code (Windows PowerShell)
1. Extract the ZIP and open the `campus-lost-found-phase1` folder in VS Code.
2. Open Terminal → New Terminal.
3. Install dependencies:
   ```powershell
   npm install
   ```
4. Copy `.env.example` to `.env`:
   ```powershell
   Copy-Item .env.example .env
   ```
5. If MongoDB is installed locally, keep the default URI:
   `MONGODB_URI=mongodb://127.0.0.1:27017/campus_lost_found`
   If using MongoDB Atlas, replace it with your own connection string. Do not share your `.env` file or upload it to GitHub.
6. Start the app:
   ```powershell
   npm start
   ```
7. Open `http://localhost:3000` in your browser.

The server starts only after it connects to MongoDB. Make sure your MongoDB service is running and the URI is correct.

## Route list
| Method | Route | Purpose |
|---|---|---|
| GET | `/` | Home page |
| GET | `/students/new` | Student form |
| POST | `/students` | Create student |
| GET | `/students/:id` | View student profile |
| GET | `/lost-items` | List and search lost reports |
| GET | `/lost-items/new` | Lost-item form |
| POST | `/lost-items` | Create lost report |
| GET | `/lost-items/:id` | View lost report |
| GET | `/found-items` | List found reports |
| GET | `/found-items/new` | Found-item form |
| POST | `/found-items` | Create found report |
| GET | `/found-items/:id` | View found report |

## Model relationships
- `Student`: stores full name, unique college email, department and contact number.
- `LostItem`: stores item information and `reportedBy`, which references a Student document.
- `FoundItem`: stores item information and `reportedBy`, which references a Student document.
- One student can report many lost items and many found items.
- MongoDB generates a unique `_id` for each document. The student name is not used as an ID.

## Suggested Phase 1 demonstration
1. Open the home page.
2. Create a student profile and show the profile page with its generated ID.
3. Submit a lost-item report using that student and show it in the lost-items list.
4. Search for the lost item and open its details.
5. Submit a found-item report and show the found-items list and details.
6. Demonstrate an empty list (if no found reports exist) and try an invalid ID such as `/students/not-an-id`.

## Notes
- Form validation in the browser improves usability, but the server also checks the submitted values.
- This is a classroom Phase 1 foundation, not a production system. Login/authentication and authorization are not included.
