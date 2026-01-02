# Meme Generator - InstantDB Integration

This meme generator app is integrated with InstantDB for real-time data synchronization, user authentication, and social features.

## 🚀 Features

- **User Authentication**: Magic link email authentication
- **Persistent Storage**: Save and load your memes
- **Social Sharing**: Share memes publicly with the community
- **Real-time Sync**: Changes sync instantly across all devices
- **Personal Library**: Organize your saved memes
- **Community Feed**: Browse and remix public memes

## 📦 InstantDB Configuration

**App ID**: `9e5e153c-43d3-4ce9-b32d-7167a34d5e7c`

The InstantDB client is configured in `lib/instant.ts`.

## 🏗️ Architecture

### Database Schema

The app uses two main collections:

#### Memes Collection
```typescript
{
  id: string;
  userId: string;
  title: string;
  imageUrl: string;
  textBoxes: string; // JSON stringified TextBox[]
  isPublic: boolean;
  createdAt: number;
  updatedAt: number;
}
```

#### Users Collection
```typescript
{
  id: string;
  email: string;
  displayName: string;
  createdAt: number;
}
```

### Key Files

- **`lib/instant.ts`**: InstantDB client initialization
- **`lib/instantdb-schema.ts`**: Schema definitions and helper functions
- **`hooks/useAuth.ts`**: Authentication hook
- **`components/AuthButton.tsx`**: Sign in/out UI
- **`components/SaveMemeDialog.tsx`**: Save meme dialog
- **`components/MemeLibrary.tsx`**: Personal meme library
- **`components/PublicMemesFeed.tsx`**: Community feed
- **`app/test-db/page.tsx`**: Testing page

## 🧪 Testing

### Automated Tests

Visit `/test-db` to run automated tests:
- Connection test
- Authentication test
- Write/Read operations
- Real-time sync verification
- Privacy checks
- Public sharing functionality

### Manual Testing

1. **Authentication Test**
   - Click "Send Code" in the header
   - Enter your email
   - Check your email for the verification code
   - Enter the code to sign in

2. **Save Meme Test**
   - Create a meme with text
   - Click "Save" button
   - Enter a title
   - Optionally mark as public
   - Click "Save"

3. **Load Meme Test**
   - Go to "My Memes" tab in sidebar
   - Click on any saved meme to load it

4. **Real-time Sync Test**
   - Open the app in two browser windows
   - Save a meme in one window
   - Check "My Memes" tab in the other window
   - The new meme should appear automatically

5. **Public Sharing Test**
   - Save a meme and mark it as public
   - Go to "Community" tab
   - Your public meme should appear in the feed
   - Other users can see and remix it

6. **Privacy Test**
   - Save memes as both public and private
   - Verify private memes only appear in "My Memes"
   - Verify public memes appear in "Community"

## 🎯 Usage

### Sign In
```typescript
const { signInWithEmail, signInWithCode } = useAuth();

// Send magic code
await signInWithEmail('user@example.com');

// Verify code
await signInWithCode('user@example.com', '123456');
```

### Save a Meme
```typescript
import { db } from '@/lib/instant';
import { createMemeData } from '@/lib/instantdb-schema';

const memeData = createMemeData(
  userId,
  'My Awesome Meme',
  imageUrl,
  textBoxes,
  isPublic
);

await db.transact([
  db.tx.memes[db.id()].update(memeData)
]);
```

### Query Memes
```typescript
// Get user's memes
const { data } = db.useQuery({
  memes: {
    $: {
      where: {
        userId: user.id,
      },
      order: {
        serverCreatedAt: 'desc',
      },
    },
  },
});

// Get public memes
const { data } = db.useQuery({
  memes: {
    $: {
      where: {
        isPublic: true,
      },
      order: {
        serverCreatedAt: 'desc',
      },
    },
  },
});
```

### Delete a Meme
```typescript
await db.transact([
  db.tx.memes[memeId].delete()
]);
```

## 🔒 Security

- **Authentication**: Magic link email authentication ensures secure access
- **Privacy**: Private memes are only visible to the owner
- **User Isolation**: Queries automatically filter by user ID for private content

## 📱 User Interface

### Header
- App title
- Authentication controls (sign in/out)

### Sidebar (3 Tabs)
1. **Templates**: Pre-made meme templates + upload button
2. **My Memes**: Personal saved memes
3. **Community**: Public memes feed

### Main Canvas
- Interactive meme editor
- Drag-and-drop text positioning
- Real-time preview

### Toolbar
- Add Text button
- Text editing controls (text, size, color)
- Save button (requires authentication)
- Download button

## 🚦 Real-time Features

InstantDB provides automatic real-time synchronization:
- New memes appear instantly in all open windows
- Updates to memes sync across devices
- Community feed updates in real-time

## 🛠️ Development

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Test InstantDB Connection
Navigate to `http://localhost:3000/test-db`

## 📚 Resources

- [InstantDB Documentation](https://www.instantdb.com/docs)
- [InstantDB Dashboard](https://www.instantdb.com/dash)
- [Next.js Documentation](https://nextjs.org/docs)

## 🎉 Success Indicators

✅ InstantDB SDK installed and configured
✅ User authentication working
✅ Memes can be saved to database
✅ Memes can be loaded from database
✅ Real-time sync is operational
✅ Public/private sharing works correctly
✅ Test page confirms all functionality

## 🐛 Troubleshooting

### Can't Sign In
- Check your email for the verification code
- Code expires after 10 minutes
- Make sure you're using a valid email address

### Memes Not Appearing
- Ensure you're signed in
- Check browser console for errors
- Verify InstantDB connection at `/test-db`

### Real-time Not Working
- Refresh the page
- Check network connection
- InstantDB uses WebSockets for real-time updates

## 💡 Next Steps

- Add user profiles and avatars
- Implement meme likes and comments
- Add meme categories and tags
- Enable meme remixing with attribution
- Add social media sharing

