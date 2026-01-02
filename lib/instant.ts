import { init, id } from '@instantdb/react';

// Define the schema for type safety
type Schema = {
  memes: {
    id: string;
    userId: string;
    title: string;
    imageUrl: string;
    textBoxes: string; // JSON stringified TextBox[]
    isPublic: boolean;
    createdAt: number;
    updatedAt: number;
  };
  users: {
    id: string;
    email: string;
    displayName: string;
    createdAt: number;
  };
};

// Initialize InstantDB with your app ID
const APP_ID = '9e5e153c-43d3-4ce9-b32d-7167a34d5e7c';

export const db = init<Schema>({ appId: APP_ID });

// Export the id function for generating unique IDs
export { id };

