# API Documentation

| Project | **Base URL** | **Version** | **Authentication** |
| :--- | :--- | :--- | :--- |
| Arkive API | `https://arkive.vercel.app/api` | 1.0.0 | Clerk Session (JWT) |

---

## 1. Authentication
All API endpoints require a valid Clerk session cookie. Authentication is handled automatically by Clerk's middleware on both client and server.

**Session Verification:**
- Client-side: Clerk's `useUser()` hook provides authenticated user data
- Server-side: Next.js API routes use `auth()` from `@clerk/nextjs/server` to verify session

**No manual token management required** - Clerk handles session tokens via httpOnly cookies.

---

## 2. Endpoints

### A. Authentication Module
*(Handled by Clerk - no custom endpoints)*

Authentication flows use Clerk's pre-built components:
- **Sign Up:** `/sign-up` page with email verification
- **Sign In:** `/sign-in` page with email or username
- **Sign Out:** Client-side via `useClerk().signOut()`

---

### B. Files Module

#### `GET /api/files`
Retrieves a list of files belonging to the authenticated user.

**Query Parameters:**

| Param | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| ownerId | string | Yes | User ID from Clerk session |
| folderId | string | No | Filter by folder ID (omit for root-level files) |
| starred | string | No | Set to `"true"` to get only starred files |
| trashed | string | No | Set to `"true"` to get only trashed files |

**Example Request:**
```bash
GET /api/files?ownerId=user_2abc123&folderId=folder_xyz
```

**Response (200 OK):**
```json
[
  {
    "id": "file_abc123",
    "name": "document.pdf",
    "url": "https://ik.imagekit.io/arkive/documents/abc123.pdf",
    "thumbnailUrl": "https://ik.imagekit.io/arkive/documents/tr:w-200/abc123.pdf",
    "size": 2048576,
    "mimetype": "application/pdf",
    "ownerId": "user_2abc123",
    "folderId": "folder_xyz",
    "starred": false,
    "trashed": false,
    "createdAt": "2025-12-17T10:30:00.000Z",
    "updatedAt": "2025-12-17T10:30:00.000Z"
  }
]
```

---

#### `POST /api/files/upload`
Uploads a single file to ImageKit and saves metadata to database.

**Request:**
- **Content-Type:** `multipart/form-data`
- **Body (FormData):**
  - `file` (File) - The file to upload
  - `ownerId` (string) - User ID
  - `folderId` (string, optional) - Parent folder ID

**Example Request:**
```javascript
const formData = new FormData();
formData.append('file', fileBlob);
formData.append('ownerId', 'user_2abc123');
formData.append('folderId', 'folder_xyz'); // optional

const response = await fetch('/api/files/upload', {
  method: 'POST',
  body: formData
});
```

**Response (201 Created):**
```json
{
  "success": true,
  "file": {
    "id": "file_abc123",
    "name": "document.pdf",
    "url": "https://ik.imagekit.io/arkive/...",
    "size": 2048576
  }
}
```

**Error (400 Bad Request):**
```json
{
  "success": false,
  "error": "ValidationError",
  "message": "No file provided"
}
```

---

#### `GET /api/files/recent`
Fetches the 10 most recently uploaded files for the authenticated user.

**Query Parameters:**

| Param | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| ownerId | string | Yes | User ID from Clerk session |
| limit | number | No | Number of files to return (default: 10, max: 50) |

**Example Request:**
```bash
GET /api/files/recent?ownerId=user_2abc123&limit=10
```

**Response (200 OK):**
```json
{
  "files": [
    {
      "id": "file_abc123",
      "name": "report.pdf",
      "url": "https://ik.imagekit.io/arkive/...",
      "size": 1024000,
      "folderId": "folder_xyz",
      "createdAt": "2025-12-17T14:30:00.000Z"
    }
  ]
}
```

---

#### `PATCH /api/files/[fileId]/star`
Toggles the starred status of a file.

**Path Parameters:**
- `fileId` - The UUID of the file

**Request Body:** *(None required - auto-toggles based on current state)*

**Response (200 OK):**
```json
{
  "success": true,
  "starred": true,
  "message": "File starred successfully"
}
```

---

#### `PATCH /api/files/[fileId]/trash`
Toggles the trashed status of a file (soft delete).

**Path Parameters:**
- `fileId` - The UUID of the file

**Request Body:** *(None required)*

**Response (200 OK):**
```json
{
  "success": true,
  "trashed": true,
  "message": "File moved to trash"
}
```

---

#### `PATCH /api/files/[fileId]/update`
Updates file metadata (rename or move to different folder).

**Path Parameters:**
- `fileId` - The UUID of the file

**Request Body:**
```json
{
  "name": "new-filename.pdf",        // optional - for rename
  "folderId": "folder_new_xyz"       // optional - for move
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "file": {
    "id": "file_abc123",
    "name": "new-filename.pdf",
    "folderId": "folder_new_xyz"
  }
}
```

---

#### `DELETE /api/files/[fileId]/delete`
Permanently deletes a file from both database and ImageKit CDN.

**Path Parameters:**
- `fileId` - The UUID of the file

**Response (200 OK):**
```json
{
  "success": true,
  "message": "File permanently deleted"
}
```

**Note:** This action is irreversible. Use trash endpoint for soft delete.

---

### C. Folders Module

#### `GET /api/folders`
Retrieves a list of folders belonging to the authenticated user.

**Query Parameters:**

| Param | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| ownerId | string | Yes | User ID from Clerk session |
| parentId | string | No | Filter by parent folder ID (omit for root-level folders) |
| starred | string | No | Set to `"true"` to get only starred folders |
| trashed | string | No | Set to `"true"` to get only trashed folders |

**Example Request:**
```bash
GET /api/folders?ownerId=user_2abc123&parentId=folder_parent
```

**Response (200 OK):**
```json
[
  {
    "id": "folder_xyz",
    "name": "Documents",
    "ownerId": "user_2abc123",
    "parentId": "folder_parent",
    "starred": false,
    "trashed": false,
    "createdAt": "2025-12-10T09:00:00.000Z",
    "updatedAt": "2025-12-10T09:00:00.000Z"
  }
]
```

---

#### `POST /api/folders/create`
Creates a new folder.

**Request Body:**
```json
{
  "name": "New Folder",
  "ownerId": "user_2abc123",
  "parentId": "folder_parent_xyz"    // optional - for nested folders
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "folder": {
    "id": "folder_new123",
    "name": "New Folder",
    "parentId": "folder_parent_xyz"
  }
}
```

**Error (400 Bad Request):**
```json
{
  "success": false,
  "error": "ValidationError",
  "message": "Folder name is required"
}
```

---

#### `POST /api/folders/upload`
Uploads an entire folder structure with nested files.

**Request:**
- **Content-Type:** `multipart/form-data`
- **Body (FormData):**
  - `ownerId` (string) - User ID
  - `parentFolderId` (string, optional) - Where to create the folder
  - `{relativePath}` (File) - Each file with its full relative path as the key

**Example Request:**
```javascript
const formData = new FormData();
formData.append('ownerId', 'user_2abc123');
formData.append('parentFolderId', 'folder_xyz');

// Files with their paths as keys
formData.append('MyFolder/file1.txt', file1Blob);
formData.append('MyFolder/subfolder/file2.pdf', file2Blob);

const response = await fetch('/api/folders/upload', {
  method: 'POST',
  body: formData
});
```

**Response (201 Created):**
```json
{
  "success": true,
  "folderId": "folder_new123",
  "folderName": "MyFolder",
  "filesUploaded": 2
}
```

---

#### `PATCH /api/folders/[folderId]/star`
Toggles the starred status of a folder.

**Path Parameters:**
- `folderId` - The UUID of the folder

**Response (200 OK):**
```json
{
  "success": true,
  "starred": true,
  "message": "Folder starred successfully"
}
```

---

#### `PATCH /api/folders/[folderId]/trash`
Toggles the trashed status of a folder (soft delete).

**Path Parameters:**
- `folderId` - The UUID of the folder

**Response (200 OK):**
```json
{
  "success": true,
  "trashed": true,
  "message": "Folder moved to trash"
}
```

**Note:** Moving a folder to trash also soft-deletes all nested folders and files.

---

#### `PATCH /api/folders/[folderId]/update`
Updates folder metadata (rename or move to different parent).

**Path Parameters:**
- `folderId` - The UUID of the folder

**Request Body:**
```json
{
  "name": "Renamed Folder",          // optional - for rename
  "parentId": "folder_new_parent"    // optional - for move
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "folder": {
    "id": "folder_xyz",
    "name": "Renamed Folder",
    "parentId": "folder_new_parent"
  }
}
```

---

#### `DELETE /api/folders/[folderId]/delete`
Permanently deletes a folder and all its contents (nested folders and files).

**Path Parameters:**
- `folderId` - The UUID of the folder

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Folder and all contents permanently deleted"
}
```

**Warning:** This is a recursive delete. All child folders and files are permanently removed from database and ImageKit CDN.

---

### D. Storage Analytics

#### `GET /api/storage`
Retrieves storage usage analytics for the authenticated user.

**Query Parameters:**

| Param | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| ownerId | string | Yes | User ID from Clerk session |

**Example Request:**
```bash
GET /api/storage?ownerId=user_2abc123
```

**Response (200 OK):**
```json
{
  "totalUsed": 524288000,
  "totalAvailable": 5368709120,
  "percentageUsed": 10,
  "categories": [
    {
      "type": "documents",
      "name": "Documents",
      "size": 209715200,
      "count": 45,
      "lastUpdate": "2025-12-17T10:30:00.000Z"
    },
    {
      "type": "images",
      "name": "Images",
      "size": 314572800,
      "count": 120,
      "lastUpdate": "2025-12-17T11:00:00.000Z"
    },
    {
      "type": "videos",
      "name": "Videos",
      "size": 0,
      "count": 0,
      "lastUpdate": null
    },
    {
      "type": "others",
      "name": "Others",
      "size": 0,
      "count": 0,
      "lastUpdate": null
    }
  ]
}
```

**Field Descriptions:**
- `totalUsed` (bytes) - Total storage used by user
- `totalAvailable` (bytes) - Total storage quota (default: 5GB)
- `percentageUsed` (number) - Usage percentage (0-100)
- `categories` - Breakdown by file type

---

### E. Search Module

#### `GET /api/search`
Searches files and folders by name across the entire user's storage.

**Query Parameters:**

| Param | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| q | string | Yes | Search query (minimum 1 character) |
| ownerId | string | Yes | User ID from Clerk session |

**Example Request:**
```bash
GET /api/search?q=report&ownerId=user_2abc123
```

**Response (200 OK):**
```json
{
  "files": [
    {
      "id": "file_abc123",
      "name": "monthly-report.pdf",
      "url": "https://ik.imagekit.io/arkive/...",
      "size": 2048576,
      "folderId": "folder_xyz",
      "folderName": "Documents"
    }
  ],
  "folders": [
    {
      "id": "folder_xyz",
      "name": "Reports 2024",
      "parentId": null
    }
  ]
}
```

**Notes:**
- Search is case-insensitive
- Uses ILIKE pattern matching: `%query%`
- Returns only non-trashed items
- Maximum 50 results per category

---

### F. Trash Management

#### `DELETE /api/empty-trash`
Permanently deletes all trashed items for the authenticated user.

**Query Parameters:**

| Param | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| ownerId | string | Yes | User ID from Clerk session |

**Example Request:**
```bash
DELETE /api/empty-trash?ownerId=user_2abc123
```

**Response (200 OK):**
```json
{
  "success": true,
  "deletedFiles": 12,
  "deletedFolders": 3,
  "message": "Trash emptied successfully"
}
```

**Warning:** This action is irreversible. All trashed files and folders are permanently deleted from database and ImageKit CDN.

---

## 3. Error Codes
The API uses standard HTTP status codes.

| Code | Meaning | Description |
| :--- | :--- | :--- |
| 200 | OK | Request succeeded. |
| 201 | Created | Resource successfully created. |
| 400 | Bad Request | Missing required fields, invalid JSON, or validation error. |
| 401 | Unauthorized | Invalid or missing Clerk session. User must sign in. |
| 403 | Forbidden | User does not have permission to access this resource. |
| 404 | Not Found | The requested resource (File/Folder) does not exist or has been deleted. |
| 409 | Conflict | Resource already exists (e.g., folder with same name in same location). |
| 413 | Payload Too Large | File size exceeds maximum allowed limit. |
| 429 | Too Many Requests | Rate limit exceeded. Retry after the specified time. |
| 500 | Server Error | Internal server error. Database or external service failure. |
| 503 | Service Unavailable | ImageKit or Clerk service is temporarily unavailable. |

---

## 4. Error Response Format
All error responses follow a consistent format:

```json
{
  "success": false,
  "error": "ErrorType",
  "message": "Human-readable error description"
}
```

**Example Errors:**

**Missing Required Field:**
```json
{
  "success": false,
  "error": "ValidationError",
  "message": "ownerId is required"
}
```

**Resource Not Found:**
```json
{
  "success": false,
  "error": "ResourceNotFound",
  "message": "File with ID file_abc123 does not exist or has been permanently deleted"
}
```

**Unauthorized:**
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "You must be signed in to access this resource"
}
```

---

## 5. Rate Limiting
*(Planned for future implementation)*

**Proposed Limits:**
- **Standard Endpoints:** 100 requests per minute per user
- **Upload Endpoints:** 10 files per minute per user
- **Search Endpoint:** 20 requests per minute per user

**Headers (Future):**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1702991400
```

---

## 6. Pagination
*(Planned for future implementation)*

Currently, all list endpoints return full result sets. Future versions will support pagination:

**Query Parameters:**
- `limit` (number) - Items per page (default: 50, max: 100)
- `page` (number) - Page number (1-indexed)
- `cursor` (string) - Cursor-based pagination for large datasets

**Response Meta:**
```json
{
  "data": [...],
  "meta": {
    "total": 250,
    "page": 1,
    "limit": 50,
    "hasMore": true,
    "nextCursor": "cursor_xyz"
  }
}
```

---

## 7. Webhooks
*(Planned for future implementation)*

Future support for real-time notifications:
- `file.uploaded` - Triggered when file upload completes
- `folder.created` - Triggered when folder is created
- `storage.limit_reached` - Triggered when user reaches 90% storage quota

---

## Appendix: Related Documents
- [PRD.md](./PRD.md) - Product requirements and user stories
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture and technical design
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Setup and deployment guide
- [README.md](../README.md) - Project overview and quick start
