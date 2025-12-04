# File Upload Implementation Guide

## Current Implementation Status

The Secure Student Portal currently uses a **text-based submission system** where students submit:
- Text content
- URLs to external files (Google Drive, GitHub, Dropbox, etc.)

## Why Text-Based?

1. **Security**: Avoids file upload vulnerabilities (malware, viruses, XSS)
2. **Simplicity**: No file storage management needed
3. **Modern**: Aligns with how modern LMS platforms work
4. **Flexible**: Students can use any cloud storage they prefer

## How to Use Current System for File Submissions

### For Admins Creating Assignments:

1. Create assignment with description
2. In the **description field**, include:
   ```
   Assignment: Data Structures Project
   
   Instructions:
   1. Complete the coding assignment
   2. Upload your code to GitHub
   3. Create a Google Docs report
   4. Submit both links in the submission form
   
   Assignment PDF: https://drive.google.com/file/d/YOUR_FILE_ID
   ```

### For Students Submitting:

1. Upload files to Google Drive / Dropbox / GitHub
2. Get shareable link
3. Submit with content like:
   ```
   Project Files: https://github.com/username/project
   Report: https://docs.google.com/document/d/xyz
   
   Summary: Implemented all required features...
   ```

---

## Option 1: Implementing Direct File Upload (Advanced)

If you want to add actual file upload functionality, here's what's needed:

### Backend Changes:

1. **Install Required Packages:**
```bash
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
# OR
pnpm add @google-cloud/storage
# OR  
pnpm add @azure/storage-blob
```

2. **Update Database Schema:**
```prisma
model Assignment {
  // ... existing fields
  fileUrl     String?    // URL to assignment file
  fileName    String?    // Original file name
  fileSize    Int?       // File size in bytes
}

model Submission {
  // ... existing fields
  fileUrl     String?    // URL to submission file
  fileName    String?    // Original file name
  fileSize    Int?       // File size in bytes
  fileType    String?    // MIME type
}
```

3. **Create Upload API:**
```typescript
// app/api/upload/route.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  // Upload to S3/Google Cloud/Azure
  const url = await uploadToCloud(file);
  
  return NextResponse.json({ url, fileName: file.name });
}
```

4. **Frontend Changes:**
```typescript
// Assignment upload form
<input
  type="file"
  accept=".pdf,.doc,.docx"
  onChange={handleFileUpload}
/>
```

### Security Considerations:

1. ✅ **File Type Validation**: Only allow specific types
2. ✅ **File Size Limits**: Max 10-50MB
3. ✅ **Virus Scanning**: Use ClamAV or cloud service
4. ✅ **Access Control**: Signed URLs with expiration
5. ✅ **Rate Limiting**: Prevent abuse

---

## Option 2: Enhanced Link-Based System (Recommended)

Improve the current system without file uploads:

### For Admin - Assignment Creation:
```typescript
interface Assignment {
  title: string;
  description: string;
  dueDate: Date;
  resourceLinks: Array<{
    name: string;
    url: string;
    type: 'PDF' | 'Document' | 'Video' | 'Other';
  }>;
}
```

### For Student - Submission:
```typescript
interface Submission {
  content: string;
  attachmentLinks: Array<{
    name: string;
    url: string;
    type: string;
  }>;
}
```

### Benefits:
- ✅ No file storage costs
- ✅ No file size limits
- ✅ Students use their preferred platforms
- ✅ Works with GitHub, Drive, Dropbox, OneDrive
- ✅ More secure (no file upload risks)

---

## Recommendation

**For your current project, I recommend:**

1. **Keep the text-based system** for security and simplicity
2. **Add clear instructions** in assignment descriptions about where to upload files
3. **Students submit shareable links** via the content field
4. **Admins click links** to review submissions

This is:
- ✅ Secure by default
- ✅ Simple to implement
- ✅ Industry-standard (Canvas, Blackboard, Moodle all support link submissions)
- ✅ No additional infrastructure needed

---

## Quick Setup for Google Drive Integration

### Step 1: Admin Creates Assignment
```
Title: Web Security Project
Description:
Assignment PDF: https://drive.google.com/file/d/1ABC.../view?usp=sharing

Instructions:
1. Download the PDF above
2. Complete the project
3. Upload to your Google Drive/GitHub
4. Get shareable link (Anyone with link can view)
5. Submit the link below
```

### Step 2: Student Submits
```
Content field:
Project Repository: https://github.com/student/project
Report Document: https://docs.google.com/document/d/XYZ.../edit?usp=sharing

Summary: Completed all 5 tasks. Implemented XSS prevention...
```

### Step 3: Admin Reviews
1. Click the submitted links
2. Review the work
3. Grade and provide feedback

---

## Need Direct File Upload?

If you absolutely need file upload functionality, I can implement it using:

1. **AWS S3** (most popular)
2. **Google Cloud Storage**
3. **Azure Blob Storage**
4. **Local storage** (not recommended for production)

Let me know which option you prefer, and I'll implement it!

---

## Current System Advantages

✅ **Security**: No file upload vulnerabilities  
✅ **Scalability**: No storage limits or costs  
✅ **Flexibility**: Students choose their platform  
✅ **Modern**: Industry-standard approach  
✅ **Simple**: Already working!  

The text-based + link submission system is actually the **recommended approach** for modern educational platforms!

