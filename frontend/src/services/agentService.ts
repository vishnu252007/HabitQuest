import { useHabitStore, type Habit } from '../store/habitStore';
import { useAuthStore } from '../store/authStore';

export interface AgentResponse {
  message: string;
  actionTaken?: 'CREATED_HABIT' | 'COMPLETED_HABIT' | 'QUERIED_STREAK' | 'QUERIED_PROGRESS' | 'CLARIFICATION_NEEDED' | 'UNKNOWN';
  speakMessage?: string;
  data?: any;
  needsClarification?: {
    field: string;
    pendingHabit: Partial<any>;
  };
}

function getLevenshteinDistance(a: string, b: string): number {
  const tmp = [];
  let i, j;
  for (i = 0; i <= a.length; i++) {
    tmp[i] = [i];
  }
  for (j = 0; j <= b.length; j++) {
    tmp[0][j] = j;
  }
  for (i = 1; i <= a.length; i++) {
    for (j = 1; j <= b.length; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1, // deletion
        tmp[i][j - 1] + 1, // insertion
        tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1) // substitution
      );
    }
  }
  return tmp[a.length][b.length];
}

const NOISE_WORDS = new Set([
  'i', 'a', 'an', 'the', 'my', 'your', 'our', 'to', 'for', 'done', 'did',
  'today', 'yesterday', 'completed', 'complete', 'finished', 'finish',
  'checked', 'check', 'add', 'create', 'new', 'habit', 'task', 'of', 'some', 'me', 'want'
]);

const COMPLETE_VERBS = ['completed', 'complete', 'did', 'finished', 'finish', 'checked', 'check', 'done'];

function detectCompleteIntent(text: string): boolean {
  const words = text.toLowerCase().split(/\s+/);
  
  // Direct matching
  for (const verb of COMPLETE_VERBS) {
    if (text.includes(verb)) return true;
  }
  
  // Fuzzy matching for spelling mistakes in verbs
  for (const word of words) {
    for (const verb of COMPLETE_VERBS) {
      if (word.length >= 5 && getLevenshteinDistance(word, verb) <= 2) {
        return true;
      }
    }
  }
  
  return false;
}

function cleanNoiseWords(text: string): string {
  const words = text.toLowerCase().split(/[\s_\-\/]+/);
  return words
    .filter(word => {
      if (NOISE_WORDS.has(word)) return false;
      // Also filter out any misspelled completed verbs
      for (const verb of COMPLETE_VERBS) {
        if (word.length >= 5 && getLevenshteinDistance(word, verb) <= 2) {
          return false;
        }
      }
      return true;
    })
    .join(' ')
    .trim();
}

// Highly intelligent fuzzy matcher to find habit by name (handles spelling mistakes)
function findMatchingHabit(habits: Habit[], targetName: string): Habit | null {
  const cleanTarget = cleanNoiseWords(targetName);
  if (!cleanTarget) return null;

  // 1. Exact match
  const exact = habits.find((h) => cleanNoiseWords(h.name) === cleanTarget);
  if (exact) return exact;

  // 2. Substring match
  const substring = habits.find(
    (h) => {
      const cleanH = cleanNoiseWords(h.name);
      return cleanH.includes(cleanTarget) || cleanTarget.includes(cleanH);
    }
  );
  if (substring) return substring;

  // 3. Word-by-word fuzzy Levenshtein match
  const targetWords = cleanTarget.split(/\s+/);
  let bestHabit: Habit | null = null;
  let minDistance = 999;

  for (const habit of habits) {
    const cleanHabitName = cleanNoiseWords(habit.name);

    // Check direct distance of entire string (e.g. "excerise" vs "exercise")
    const fullDist = getLevenshteinDistance(cleanTarget, cleanHabitName);
    const threshold = Math.max(2, Math.floor(cleanHabitName.length / 3)); // dynamic threshold
    if (fullDist < minDistance && fullDist <= threshold) {
      minDistance = fullDist;
      bestHabit = habit;
    }

    // Check distance of individual words (e.g. "my task excerise task" -> "excerise" vs "exercise")
    for (const word of targetWords) {
      if (word.length < 3) continue; // skip short words like 'my', 'i', 'to'
      const dist = getLevenshteinDistance(word, cleanHabitName);
      const wordThreshold = Math.max(2, Math.floor(cleanHabitName.length / 3));
      if (dist < minDistance && dist <= wordThreshold) {
        minDistance = dist;
        bestHabit = habit;
      }
    }
  }

  return bestHabit;
}

// Category detector helper
function detectCategory(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('health') || lower.includes('water') || lower.includes('sleep') || lower.includes('eat') || lower.includes('diet')) {
    return 'health';
  }
  if (lower.includes('fitness') || lower.includes('workout') || lower.includes('gym') || lower.includes('run') || lower.includes('walk')) {
    return 'fitness';
  }
  if (lower.includes('mind') || lower.includes('meditat') || lower.includes('journal') || lower.includes('yoga')) {
    return 'mindfulness';
  }
  if (lower.includes('learn') || lower.includes('read') || lower.includes('study') || lower.includes('code') || lower.includes('book')) {
    return 'learning';
  }
  return 'productivity';
}

// Emoji picker helper
function detectEmoji(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('water') || lower.includes('drink')) return '💧';
  if (lower.includes('workout') || lower.includes('gym') || lower.includes('exercise')) return '🏋️‍♂️';
  if (lower.includes('run') || lower.includes('walk')) return '🏃‍♂️';
  if (lower.includes('read') || lower.includes('book') || lower.includes('study')) return '📚';
  if (lower.includes('meditat') || lower.includes('mind')) return '🧘‍♂️';
  if (lower.includes('code') || lower.includes('program')) return '💻';
  if (lower.includes('smoke') || lower.includes('quit')) return '🚫';
  if (lower.includes('junk') || lower.includes('sugar')) return '🥦';
  if (lower.includes('sleep')) return '😴';
  return '⭐';
}

async function callGeminiAgent(
  rawInput: string,
  habits: Habit[],
  apiKey: string
): Promise<any> {
  const habitsList = habits.map((h) => ({ id: h.id, name: h.name, category: h.category }));

  const systemPrompt = `
You are the brain of the HabitQuest Voice Agent.
The user spoke or typed: "${rawInput}"
Here are the active habits currently registered in the database:
${JSON.stringify(habitsList)}

Analyze the user's input:
1. If they are trying to mark a habit as complete (e.g., "completed workout", "did excerise today", "i drank water"):
   - Set intent to "COMPLETE_HABIT".
   - Find the closest semantic match or spelling-corrected match from the active habits list.
   - Return their matchedHabitId.
2. If they are trying to create a new habit or bad habit:
   - Set intent to "CREATE_HABIT".
   - Extract the habitName, category, and pointValue (default to 15 if not mentioned).
3. If they are checking streaks:
   - Set intent to "QUERY_STREAK".
4. If they are checking progress/points:
   - Set intent to "QUERY_PROGRESS".
5. Otherwise set intent to "UNKNOWN".

Respond ONLY with a valid JSON block containing:
{
  "intent": "CREATE_HABIT" | "COMPLETE_HABIT" | "QUERY_STREAK" | "QUERY_PROGRESS" | "UNKNOWN",
  "habitName": string,
  "matchedHabitId": number,
  "pointValue": number,
  "category": string,
  "speakResponse": string
}
Return raw JSON only. Do not wrap in markdown tags like \`\`\`json.
`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: systemPrompt }] }]
    })
  });

  if (!response.ok) {
    throw new Error('Gemini API call failed');
  }

  const resData = await response.json();
  const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
  return JSON.parse(cleanJson);
}

export async function processVoiceCommand(
  rawInput: string,
  pendingContext?: { field: string; pendingHabit: Partial<any> } | null,
  geminiApiKey?: string | null
): Promise<AgentResponse> {
  const text = rawInput.toLowerCase().trim();
  const store = useHabitStore.getState();
  const authStore = useAuthStore.getState();
  const user = authStore.user;

  if (!text) {
    return {
      message: 'I didn\'t catch that. Please speak or type your habit command.',
      speakMessage: 'I didn\'t catch that. Please try again.',
      actionTaken: 'UNKNOWN',
    };
  }

  // ── 0. Optional Gemini API Processing ──
  if (geminiApiKey) {
    try {
      const activeHabits = store.getActiveHabits();
      const geminiResult = await callGeminiAgent(rawInput, activeHabits, geminiApiKey);

      if (geminiResult && geminiResult.intent) {
        if (geminiResult.intent === 'COMPLETE_HABIT') {
          const matchedId = geminiResult.matchedHabitId;
          const habit = activeHabits.find((h) => h.id === matchedId);

          if (habit) {
            const res = await store.toggleLog(habit.id);
            const isLevelUp = res?.levelUp;
            let msg = `Marked "${habit.name}" as completed! You earned +${habit.point_value} XP points! 🎉`;
            if (isLevelUp) msg += ` 🚀 LEVEL UP! You reached Level ${res.newLevel}!`;

            return {
              message: msg,
              speakMessage: geminiResult.speakResponse || `Marked ${habit.name} complete!`,
              actionTaken: 'COMPLETED_HABIT',
              data: habit,
            };
          }
        }

        if (geminiResult.intent === 'CREATE_HABIT' && geminiResult.habitName) {
          const isBadHabit = geminiResult.category === 'bad_habit';
          const newHabit = {
            name: geminiResult.habitName,
            description: isBadHabit ? 'Added via Gemini Agent to overcome' : 'Added via Gemini Agent',
            category: geminiResult.category || 'productivity',
            frequency: 'daily',
            point_value: geminiResult.pointValue || 15,
            color: isBadHabit ? '#ef4444' : '#10b981',
            emoji: detectEmoji(geminiResult.habitName),
          };

          await store.addHabit(newHabit);

          return {
            message: `Created new habit: "${newHabit.name}" (${newHabit.emoji}, +${newHabit.point_value} pts per day)! ✨`,
            speakMessage: geminiResult.speakResponse || `Created new habit ${newHabit.name}`,
            actionTaken: 'CREATED_HABIT',
            data: newHabit,
          };
        }

        if (geminiResult.intent === 'QUERY_STREAK') {
          const streaks = store.streaks;
          const maxStreak = streaks.length > 0 ? Math.max(0, ...streaks.map((s) => s.currentStreak)) : 0;
          return {
            message: geminiResult.speakResponse || `Your current top streak is ${maxStreak} days!`,
            speakMessage: geminiResult.speakResponse || `Your top streak is ${maxStreak} days!`,
            actionTaken: 'QUERIED_STREAK',
          };
        }

        if (geminiResult.intent === 'QUERY_PROGRESS') {
          return {
            message: geminiResult.speakResponse || `You are Level ${user?.level} with ${user?.total_points} XP!`,
            speakMessage: geminiResult.speakResponse || `You are Level ${user?.level} with ${user?.total_points} points!`,
            actionTaken: 'QUERIED_PROGRESS',
          };
        }
      }
    } catch (err) {
      console.warn('Gemini processing failed, falling back to local NLP:', err);
    }
  }

  // ── 1. Handle Incomplete Clarification Reply (Local Fallback) ──
  if (pendingContext) {
    const { field, pendingHabit } = pendingContext;
    if (field === 'category') {
      const category = detectCategory(text);
      const fullHabit = {
        name: pendingHabit.name || 'New Habit',
        description: pendingHabit.description || 'Added via Voice Assistant',
        category,
        frequency: pendingHabit.frequency || 'daily',
        point_value: pendingHabit.point_value || 15,
        color: pendingHabit.category === 'bad_habit' ? '#ef4444' : '#10b981',
        emoji: detectEmoji(pendingHabit.name || ''),
      };

      await store.addHabit(fullHabit);
      return {
        message: `Great! I assigned the category "${category}" and added your habit "${fullHabit.name}" (+${fullHabit.point_value} pts).`,
        speakMessage: `Awesome! Added ${fullHabit.name} under ${category}.`,
        actionTaken: 'CREATED_HABIT',
      };
    }
  }

  // ── 2. QUERY STREAK / PROGRESS (Local Fallback) ──
  if (text.includes('streak') || text.includes('clean days') || text.includes('fire')) {
    const habits = store.getActiveHabits();
    const streaks = store.streaks;
    const maxStreak = streaks.length > 0 ? Math.max(0, ...streaks.map((s) => s.currentStreak)) : 0;
    const activeCount = habits.length;

    const reply = `You currently have ${activeCount} active habits with a top streak of ${maxStreak} days! Keep up the momentum! 🔥`;
    return {
      message: reply,
      speakMessage: `You have ${activeCount} active habits with a top streak of ${maxStreak} days! Keep it up!`,
      actionTaken: 'QUERIED_STREAK',
      data: { maxStreak, activeCount },
    };
  }

  if (text.includes('progress') || text.includes('how am i doing') || text.includes('score') || text.includes('points') || text.includes('level')) {
    const habits = store.getActiveHabits();
    const todayLogs = store.todayLogs;
    const completedToday = todayLogs.filter((l) => l.completed).length;

    const reply = `You are Level ${user?.level ?? 1} with ${user?.total_points ?? 0} XP points! Today you completed ${completedToday} out of ${habits.length} habits.`;
    return {
      message: reply,
      speakMessage: `You are Level ${user?.level ?? 1} with ${user?.total_points ?? 0} points. You have completed ${completedToday} habits today!`,
      actionTaken: 'QUERIED_PROGRESS',
      data: { level: user?.level, points: user?.total_points, completedToday },
    };
  }

  // ── 3. MARK HABIT COMPLETED (Local Fallback) ──
  if (detectCompleteIntent(text)) {
    const habits = store.getActiveHabits();

    // Extract clean target name by removing common grammatical noise words
    const cleanName = cleanNoiseWords(text);

    const matchedHabit = findMatchingHabit(habits, cleanName) || findMatchingHabit(habits, text);

    if (matchedHabit) {
      const res = await store.toggleLog(matchedHabit.id);
      const isLevelUp = res?.levelUp;

      let msg = `Marked "${matchedHabit.name}" as completed! You earned +${matchedHabit.point_value} XP points! 🎉`;
      let voiceMsg = `Awesome job! Marked ${matchedHabit.name} complete! Plus ${matchedHabit.point_value} points!`;

      if (isLevelUp) {
        msg += ` 🚀 LEVEL UP! You reached Level ${res.newLevel}!`;
        voiceMsg += ` Fantastic! You leveled up to Level ${res.newLevel}!`;
      }

      return {
        message: msg,
        speakMessage: voiceMsg,
        actionTaken: 'COMPLETED_HABIT',
        data: matchedHabit,
      };
    } else {
      return {
        message: `I couldn't find a matching active habit for "${cleanName || text}". Please check your habit list or say "Add habit ${cleanName}" to create it.`,
        speakMessage: `I couldn't find that habit in your list. Would you like to create it?`,
        actionTaken: 'CLARIFICATION_NEEDED',
      };
    }
  }

  // ── 4. CREATE HABIT OR BAD HABIT (Local Fallback) ──
  if (text.includes('add') || text.includes('create') || text.includes('new habit') || text.includes('quit') || text.includes('stop')) {
    const isBadHabit = text.includes('quit') || text.includes('stop') || text.includes('bad habit');

    let habitName = text
      .replace(/add|create|new habit|a habit|habit|quit|stop|bad|good|to|everyday|daily/gi, '')
      .replace(/\d+\s*(points|pts)/gi, '')
      .trim();

    if (!habitName) {
      return {
        message: 'What is the name of the habit you would like to create?',
        speakMessage: 'What is the name of the habit you want to add?',
        actionTaken: 'CLARIFICATION_NEEDED',
      };
    }

    habitName = habitName.charAt(0).toUpperCase() + habitName.slice(1);
    const ptsMatch = text.match(/(\d+)\s*(points|pts)/i);
    const pointValue = ptsMatch ? parseInt(ptsMatch[1], 10) : 15;

    const category = isBadHabit ? 'bad_habit' : detectCategory(habitName);
    const emoji = detectEmoji(habitName);

    const newHabit = {
      name: habitName,
      description: isBadHabit ? 'Added via QuestAI Voice Assistant to overcome' : 'Added via QuestAI Voice Assistant',
      category,
      frequency: 'daily',
      point_value: pointValue,
      color: isBadHabit ? '#ef4444' : '#10b981',
      emoji,
    };

    await store.addHabit(newHabit);

    return {
      message: `Created new ${isBadHabit ? 'bad habit to overcome' : 'habit'}: "${habitName}" (${emoji}, +${pointValue} pts per day)! ✨`,
      speakMessage: `Awesome! Created ${isBadHabit ? 'bad habit to overcome' : 'new habit'} ${habitName}.`,
      actionTaken: 'CREATED_HABIT',
      data: newHabit,
    };
  }

  // ── DEFAULT / GENERAL CONVERSATIONAL RESPONSE ──
  return {
    message: `QuestAI Voice Assistant is ready! Try saying:\n• "Add a habit to drink water for 20 points"\n• "I completed workout today"\n• "What is my streak?"\n• "How is my progress?"`,
    speakMessage: `I am your QuestAI voice assistant. You can ask me to add habits, mark tasks complete, or check your streaks!`,
    actionTaken: 'UNKNOWN',
  };
}
