import { db, id } from './instant';

/**
 * Utility functions for testing InstantDB integration
 */

export async function testConnection() {
  try {
    // @ts-ignore - InstantDB type inference issue
    const result = await db.queryOnce({ memes: {} });
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error };
  }
}

export async function testAuth() {
  const { user } = db.useAuth();
  return {
    isAuthenticated: !!user,
    user,
  };
}

export async function testWrite(userId: string, testData: any) {
  try {
    const memeId = id();
    // @ts-ignore - InstantDB type inference issue
    await db.transact([db.tx.memes[memeId].update(testData)]);
    return { success: true, id: memeId };
  } catch (error) {
    return { success: false, error };
  }
}

export async function testRead(memeId: string) {
  try {
    // @ts-ignore - InstantDB type inference issue
    const result = await db.queryOnce({
      memes: {
        $: {
          where: {
            id: memeId,
          },
        },
      },
    });
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error };
  }
}

export async function testDelete(memeId: string) {
  try {
    // @ts-ignore - InstantDB type inference issue
    await db.transact([db.tx.memes[memeId].delete()]);
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

export function logTestResult(testName: string, success: boolean, details?: any) {
  const emoji = success ? '✅' : '❌';
  console.log(`${emoji} ${testName}:`, details || (success ? 'PASSED' : 'FAILED'));
}

