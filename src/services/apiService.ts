/**
 * API Service for connecting with RandomPlayables platform
 * Handles session management and data storage
 */

// This now correctly uses the proxy for development and a real URL for production
const API_BASE_URL = import.meta.env.MODE === 'production'
  ? 'https://www.randomplayables.com/api'
  : '/api';

console.log("Using API base URL:", API_BASE_URL);

// Game ID for Free Sets
const GAME_ID = import.meta.env.VITE_GAME_ID;

// Session storage keys
const SESSION_STORAGE_KEY = 'gameSession';
const SESSION_CREATION_TIME_KEY = 'gameSessionCreationTime';

// Extract authentication and survey context data from URL if present
function getContextFromURL() {
  if (typeof window === 'undefined') {
    return { token: null, userId: null, username: null, surveyMode: false, questionId: null };
  }
  
  const urlParams = new URLSearchParams(window.location.search);
  const authToken = urlParams.get('authToken');
  const userId = urlParams.get('userId');
  const username = urlParams.get('username');
  const surveyMode = urlParams.get('surveyMode') === 'true';
  const questionId = urlParams.get('questionId');
  
  console.log("Auth & Survey params extracted:", { 
    token: !!authToken, 
    userId, 
    username,
    surveyMode,
    questionId
  });
  
  return { token: authToken, userId, username, surveyMode, questionId };
}

// We use a Promise to ensure multiple simultaneous calls wait for the same result
let sessionInitPromise: Promise<any> | null = null;

/**
 * Initializes a game session with the platform
 * @returns Session information including sessionId
 */
export async function initGameSession() {
  // If we already have a promise in progress, return it to prevent duplicate calls
  if (sessionInitPromise) {
    console.log("Session initialization already in progress, waiting for result...");
    return sessionInitPromise;
  }

  // Create a new promise for this initialization
  sessionInitPromise = (async () => {
    try {
      // Force a new session on every app start, but avoid creating duplicates 
      // during React's StrictMode double-mounting
      
      // Check for a recent session (created in the last 3 seconds)
      const lastCreationTime = localStorage.getItem(SESSION_CREATION_TIME_KEY);
      const currentSession = localStorage.getItem(SESSION_STORAGE_KEY);
      const now = Date.now();
      
      // If we have a session that was created very recently (within 3 seconds),
      // it's likely due to React StrictMode's double-mounting
      if (lastCreationTime && currentSession) {
        const timeSinceCreation = now - parseInt(lastCreationTime);
        if (timeSinceCreation < 3000) { // 3 seconds
          console.log(`Using recently created session (${timeSinceCreation}ms ago)`);
          return JSON.parse(currentSession);
        }
      }
      
      // Remove any existing session data
      localStorage.removeItem(SESSION_STORAGE_KEY);
      
      // Get authentication and survey context from URL if available
      const { token, userId, username, surveyMode, questionId } = getContextFromURL();
      
      // Create a new session
      console.log("Initializing new game session with platform...");
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Add authentication token if available
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Pass survey context to the backend API
      const response = await fetch(`${API_BASE_URL}/game-session`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          gameId: GAME_ID,
          passedUserId: userId,
          passedUsername: username,
          surveyMode: surveyMode,
          surveyQuestionId: questionId
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        console.warn(`Could not connect to RandomPlayables platform. Status: ${response.status}. Using local session.`);
        const localSession = {
          sessionId: `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          userId: userId || null,
          username: username || null,
          isGuest: !userId,
          gameId: GAME_ID
        };
        
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(localSession));
        localStorage.setItem(SESSION_CREATION_TIME_KEY, now.toString());
        
        return localSession;
      }
      
      const session = await response.json();
      console.log("Created new game session:", session);
      
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      localStorage.setItem(SESSION_CREATION_TIME_KEY, now.toString());
      
      // Conditionally send a message back to the parent window
      if (surveyMode && window.parent) {
          console.log('Game is in survey mode. Posting session data to parent window.');
          window.parent.postMessage({ type: 'GAME_SESSION_CREATED', payload: session }, '*');
      }

      return session;
    } catch (error) {
      console.error('Error initializing game session:', error);
      
      const { userId, username } = getContextFromURL();
      
      // Fallback to local session
      const localSession = {
        sessionId: `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        userId: userId || null,
        username: username || null,
        isGuest: !userId,
        gameId: GAME_ID
      };
      
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(localSession));
      localStorage.setItem(SESSION_CREATION_TIME_KEY, Date.now().toString());
      
      return localSession;
    } finally {
      setTimeout(() => {
        sessionInitPromise = null;
      }, 5000);
    }
  })();
  
  return sessionInitPromise;
}

/**
 * Saves round data to the platform
 * @param roundNumber Current round number
 * @param roundData Data to be saved
 * @returns Response from the server or null if offline
 */
export async function saveGameData(roundNumber: number, roundData: any) {
  try {
    // Log data to console for development/debugging
    console.log('Saving round data:', { roundNumber, roundData });
    
    // Get the current session
    const sessionString = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!sessionString) {
      console.error('No active game session found in localStorage');
      throw new Error('No active game session');
    }
    
    const session = JSON.parse(sessionString);
    console.log('Using session for saving data:', session);
    
    // Check if this is a local session (offline mode)
    if (session.sessionId.startsWith('local-')) {
      console.log('Using local session, storing in localStorage');
      // Store in localStorage as backup
      const offlineData = JSON.parse(localStorage.getItem('offlineGameData') || '[]');
      offlineData.push({ roundNumber, roundData, timestamp: new Date().toISOString() });
      localStorage.setItem('offlineGameData', JSON.stringify(offlineData));
      return { success: true, offline: true };
    }
    
    // Get authentication from URL if available
    const { token, userId, username } = getContextFromURL();
    
    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add authentication token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Send data to the server
    console.log(`Sending data to ${API_BASE_URL}/game-data`);
    const response = await fetch(`${API_BASE_URL}/game-data`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({
        sessionId: session.sessionId,
        roundNumber,
        roundData,
        ...(userId ? { passedUserId: userId } : {}),
        ...(username ? { passedUsername: username } : {})
      }),
    });
    
    if (!response.ok) {
      console.error('Server response not OK:', response.status, response.statusText);
      // Try to get error details
      try {
        const errorData = await response.json();
        console.error('Error details:', errorData);
      } catch (e) {
        console.error('Could not parse error response');
      }
      
      // Fall back to storing locally if server request fails
      const offlineData = JSON.parse(localStorage.getItem('offlineGameData') || '[]');
      offlineData.push({ roundNumber, roundData, timestamp: new Date().toISOString() });
      localStorage.setItem('offlineGameData', JSON.stringify(offlineData));
      return { success: true, offline: true };
    }
    
    const result = await response.json();
    console.log('Server response:', result);
    return result;
  } catch (error) {
    console.error('Error saving game data:', error);
    // Store in localStorage as backup
    const offlineData = JSON.parse(localStorage.getItem('offlineGameData') || '[]');
    offlineData.push({ roundNumber, roundData, timestamp: new Date().toISOString() });
    localStorage.setItem('offlineGameData', JSON.stringify(offlineData));
    return { success: true, offline: true };
  }
}