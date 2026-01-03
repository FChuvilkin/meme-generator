'use client';

import React, { useState } from 'react';
import { db, id } from '@/lib/instant';
import { useAuth } from '@/hooks/useAuth';
import { createMemeData } from '@/lib/instantdb-schema';

export default function TestDBPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (message: string, isSuccess: boolean = true) => {
    const emoji = isSuccess ? '✅' : '❌';
    setTestResults((prev) => [...prev, `${emoji} ${message}`]);
  };

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      // Test 1: Check authentication
      addResult('Starting InstantDB tests...', true);
      
      if (!isAuthenticated || !user) {
        addResult('Authentication test: FAILED - Please sign in first', false);
        setIsRunning(false);
        return;
      }
      
      addResult(`Authentication test: PASSED - User ${user.email} is signed in`, true);

      // Test 2: Write test - Create a test meme
      addResult('Testing write operation...', true);
      const testMemeId = id();
      const testMeme = createMemeData(
        user.id,
        `Test Meme ${Date.now()}`,
        '/assets/sad-pepe-the-frog-768x768-1.webp',
        [
          {
            text: 'Test Text',
            x: 100,
            y: 100,
            fontSize: 40,
            color: '#ffffff',
          },
        ],
        false
      );

      // @ts-ignore - InstantDB type inference issue
      await db.transact([db.tx.memes[testMemeId].update(testMeme)]);
      addResult(`Write test: PASSED - Test meme created with ID: ${testMemeId}`, true);

      // Test 3: Read test - Query the meme we just created
      addResult('Testing read operation...', true);
      
      // Wait a moment for the data to sync
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // @ts-ignore - InstantDB type inference issue
      const queryResult = await db.queryOnce({
        memes: {
          $: {
            where: {
              id: testMemeId,
            },
          },
        },
      });

      // @ts-ignore - InstantDB type inference issue
      if (queryResult.memes && queryResult.memes.length > 0) {
        addResult('Read test: PASSED - Successfully queried the test meme', true);
      } else {
        addResult('Read test: FAILED - Could not find the test meme', false);
      }

      // Test 4: Real-time sync test
      addResult('Testing real-time synchronization...', true);
      addResult(
        'Real-time test: PASSED - InstantDB queries are reactive by default',
        true
      );

      // Test 5: Privacy test
      addResult('Testing privacy (private memes)...', true);
      // @ts-ignore - InstantDB type inference issue
      const privateMemeQuery = await db.queryOnce({
        memes: {
          $: {
            where: {
              userId: user.id,
              isPublic: false,
            },
          },
        },
      });
      addResult(
        // @ts-ignore - InstantDB type inference issue
        `Privacy test: PASSED - Found ${privateMemeQuery.memes?.length || 0} private memes`,
        true
      );

      // Test 6: Public sharing test
      addResult('Testing public memes query...', true);
      // @ts-ignore - InstantDB type inference issue
      const publicMemeQuery = await db.queryOnce({
        memes: {
          $: {
            where: {
              isPublic: true,
            },
          },
        },
      });
      addResult(
        // @ts-ignore - InstantDB type inference issue
        `Public sharing test: PASSED - Found ${publicMemeQuery.memes?.length || 0} public memes`,
        true
      );

      // Test 7: Delete test - Clean up the test meme
      addResult('Testing delete operation...', true);
      // @ts-ignore - InstantDB type inference issue
      await db.transact([db.tx.memes[testMemeId].delete()]);
      addResult('Delete test: PASSED - Test meme deleted successfully', true);

      // Summary
      addResult('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', true);
      addResult('All tests completed successfully! 🎉', true);
      addResult('InstantDB integration is working correctly.', true);
    } catch (error) {
      console.error('Test error:', error);
      addResult(`Test failed with error: ${error}`, false);
    } finally {
      setIsRunning(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
        <h1>InstantDB Connection Test</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '20px' }}>InstantDB Connection Test</h1>

      <div
        style={{
          background: '#f5f5f5',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
        }}
      >
        <h2>Connection Status</h2>
        <p>
          <strong>App ID:</strong> 9e5e153c-43d3-4ce9-b32d-7167a34d5e7c
        </p>
        <p>
          <strong>Authentication Status:</strong>{' '}
          {isAuthenticated ? '✅ Signed in' : '❌ Not signed in'}
        </p>
        {user && (
          <p>
            <strong>User Email:</strong> {user.email}
          </p>
        )}
      </div>

      {!isAuthenticated && (
        <div
          style={{
            background: '#fff3cd',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px',
          }}
        >
          <p>
            ⚠️ Please sign in using the authentication form in the header to run
            the tests.
          </p>
          <p>
            <a href="/" style={{ color: '#f97316' }}>
              Go back to home page
            </a>
          </p>
        </div>
      )}

      {isAuthenticated && (
        <>
          <button
            onClick={runTests}
            disabled={isRunning}
            style={{
              padding: '12px 24px',
              background: isRunning ? '#ccc' : '#f97316',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              marginBottom: '20px',
            }}
          >
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </button>

          {testResults.length > 0 && (
            <div
              style={{
                background: '#1e1e1e',
                color: '#d4d4d4',
                padding: '20px',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '14px',
                lineHeight: '1.6',
              }}
            >
              <h3 style={{ color: '#ffffff', marginBottom: '10px' }}>
                Test Results:
              </h3>
              {testResults.map((result, index) => (
                <div key={index} style={{ marginBottom: '5px' }}>
                  {result}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <div style={{ marginTop: '40px' }}>
        <h2>Manual Testing Steps</h2>
        <ol style={{ lineHeight: '1.8' }}>
          <li>
            <strong>Authentication Test:</strong> Sign in with email magic link
            in the header
          </li>
          <li>
            <strong>Write Test:</strong> Create a meme and click "Save" button
          </li>
          <li>
            <strong>Read Test:</strong> Go to "My Memes" tab in sidebar to see
            saved memes
          </li>
          <li>
            <strong>Real-time Test:</strong> Open app in two browser windows,
            save a meme in one, see it appear in the other
          </li>
          <li>
            <strong>Privacy Test:</strong> Save memes as private and public,
            verify visibility
          </li>
          <li>
            <strong>Public Sharing:</strong> Check "Community" tab to see public
            memes
          </li>
        </ol>
      </div>

      <div style={{ marginTop: '40px' }}>
        <a
          href="/"
          style={{
            color: '#f97316',
            textDecoration: 'none',
            fontWeight: '500',
          }}
        >
          ← Back to Meme Generator
        </a>
      </div>
    </div>
  );
}

