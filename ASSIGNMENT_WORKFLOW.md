# Assignment Workflow Guide

## Overview
The Secure Student Portal handles assignments through a text-based submission system. Here's how it works:

---

## 📝 Current Implementation

### For Admins:

1. **Create Assignment**
   - Go to Dashboard → "Manage Assignments" → "+ Add Assignment"
   - Fill in:
     - **Course**: Select from existing courses
     - **Title**: Assignment name (e.g., "Web Security Assignment 1")
     - **Description**: Assignment instructions and requirements
     - **Due Date**: Submission deadline
   - Click "Add Assignment"

2. **View Submissions**
   - Submissions appear in the "Recent Activity" section on the admin dashboard
   - Each submission shows:
     - Student name
     - Assignment title
     - Submission content (text)
     - Status (PENDING, GRADED, REJECTED)
     - Submission date

3. **Grade Submissions**
   - Currently, the system stores submissions with text content
   - Admins can view submission details
   - Grading functionality includes:
     - Assigning a grade (0-100)
     - Providing feedback
     - Changing status to GRADED or REJECTED

### For Students:

1. **View Assignments**
   - After enrolling in a course, students see assignments on their dashboard
   - Each assignment shows:
     - Course code
     - Assignment title
     - Description/Instructions
     - Due date
     - Submission status

2. **Submit Assignment**
   - Students submit assignments through the API
   - Current format: Text-based submissions
   - The submission includes:
     - Assignment ID
     - Student ID (from session)
     - Content (text)

3. **View Submission Status**
   - Students can see their recent submissions
   - Status indicators:
     - 🟡 PENDING: Submitted, awaiting review
     - ✅ GRADED: Reviewed with grade and feedback
     - ❌ REJECTED: Needs revision

---

## 🔄 Assignment Lifecycle

```
1. Admin creates assignment → 
2. Student enrolls in course → 
3. Student sees assignment → 
4. Student submits (text content) → 
5. Admin reviews submission → 
6. Admin grades and provides feedback → 
7. Student views grade and feedback
```

---

## 📤 Current Submission Format

**Text-Based Submissions:**
- Students submit text content directly
- Content can include:
  - Written answers
  - Code snippets
  - URLs to external resources (Google Drive, GitHub, etc.)
  - References and citations

**Example Submission:**
```
Assignment: Web Security Assignment 1
Content: 
"I have completed the assignment. Please find my work at:
https://docs.google.com/document/d/xyz...
or
https://github.com/username/repo

Summary: I implemented the following security features..."
```

---

## 🚀 Future Enhancements (Not Implemented)

If you want to add file upload functionality in the future, you would need to:

### Option 1: Cloud Storage Integration
- Integrate AWS S3, Google Cloud Storage, or Azure Blob Storage
- Students upload files to cloud storage
- Store file URLs in the database
- Admin downloads files from cloud storage

### Option 2: Direct File Upload
- Use Next.js API routes with multipart/form-data
- Store files in a dedicated `/uploads` directory
- Implement file validation (type, size)
- Add virus scanning for security
- Serve files through protected routes

### Database Schema Changes Needed:
```typescript
model Submission {
  // ... existing fields
  fileUrl     String?    // URL to uploaded file
  fileName    String?    // Original file name
  fileSize    Int?       // File size in bytes
  fileType    String?    // MIME type
}
```

---

## 💡 Best Practices (Current System)

### For Admins:
1. **Clear Instructions**: Provide detailed assignment descriptions
2. **Realistic Deadlines**: Set appropriate due dates
3. **Consistent Grading**: Use rubrics and provide detailed feedback
4. **Timely Reviews**: Grade submissions promptly

### For Students:
1. **Submit Early**: Don't wait until the deadline
2. **Include Links**: If work is external, provide clear access links
3. **Add Context**: Explain your submission in the content field
4. **Check Status**: Monitor your submission status regularly

---

## 🔐 Security Features

The current system includes:
- ✅ **Authorization**: Only enrolled students can view course assignments
- ✅ **Validation**: Input sanitization and validation
- ✅ **Audit Logging**: All submissions are logged
- ✅ **Session Security**: Secure session management
- ✅ **Role-Based Access**: Students vs. Admin permissions

---

## 📊 How to View Submissions (Admin)

### Via Dashboard:
1. Login as Admin
2. Dashboard shows "Recent Activity" with latest submissions
3. See student name, assignment, status, and date

### Via API:
```javascript
GET /api/submissions
- Returns all submissions with student and assignment details
- Filterable by status (PENDING, GRADED, REJECTED)
```

---

## 🎯 Example Use Cases

### Use Case 1: Essay Assignment
1. Admin creates assignment: "Write a 500-word essay on SQL Injection"
2. Student submits: Text content with the essay
3. Admin grades: Assigns 85/100 with feedback

### Use Case 2: Code Assignment
1. Admin creates: "Implement authentication system"
2. Student submits: GitHub repository URL + explanation
3. Admin reviews: Checks GitHub, grades, provides feedback

### Use Case 3: Document Assignment
1. Admin creates: "Security Audit Report"
2. Student submits: Google Docs link + access instructions
3. Admin reviews: Opens doc, grades, comments

---

## 📝 Notes

- The system is designed for simplicity and security
- Text-based submissions avoid file upload vulnerabilities
- Students can still share work via cloud links (Google Drive, Dropbox, GitHub)
- This approach is common in modern LMS platforms (Canvas, Blackboard allow link submissions)
- For file uploads, external cloud storage integration is recommended over direct uploads

---

## 🔧 Technical Implementation

### Database Models:
- **Assignment**: Stores assignment details
- **Submission**: Stores student submissions
- **Enrollment**: Links students to courses

### API Endpoints:
- `POST /api/assignments` - Create assignment (Admin)
- `GET /api/assignments` - List assignments
- `POST /api/submissions` - Submit assignment (Student)
- `GET /api/submissions` - View submissions (Admin)
- `PATCH /api/submissions/[id]` - Grade submission (Admin)

### Frontend Pages:
- `/dashboard/admin/assignments` - Manage assignments
- `/dashboard/student` - View assignments and submit
- `/dashboard/admin` - View recent submissions

