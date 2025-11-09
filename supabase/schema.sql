-- Create players table
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  number TEXT NOT NULL UNIQUE,
  score INTEGER DEFAULT 0,
  current_case TEXT,
  completed_cases TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create cases table
CREATE TABLE IF NOT EXISTS cases (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  brief TEXT NOT NULL,
  unlock_time TIMESTAMPTZ NOT NULL,
  questions JSONB NOT NULL,
  max_score INTEGER NOT NULL
);

-- Create index on players for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_players_score ON players(score DESC);

-- Create index on cases for unlock time
CREATE INDEX IF NOT EXISTS idx_cases_unlock_time ON cases(unlock_time);

-- Create leaderboard view
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
  ROW_NUMBER() OVER (ORDER BY score DESC, created_at ASC) as rank,
  name,
  number,
  score
FROM players
ORDER BY score DESC, created_at ASC;

-- Insert sample cases
INSERT INTO cases (id, title, brief, unlock_time, questions, max_score) VALUES
(
  'case_1',
  'The Reversal Riddle',
  'It was a quiet night in Algo City when detective Lexa Code was called to the Cyber Archives. A hacker named Dr. Reverse had broken in again — this time, every message in the system looked strange. Some were written backward, others had half-open brackets, and all the clues seemed connected. On the main terminal, three mysterious lines glowed: 1️⃣ ((Secret)(Safe)) 2️⃣ )Locked( 3️⃣ !dlroW olleH. A note flashed on the screen: "I hide things the way I store them..." Lexa smiled. "He''s used this trick before," she whispered. Now it''s your turn to uncover the pattern and decode the clues.',
  NOW(),
  '[
    {
      "q": "From the hacker''s note — Which data structure is he using? (case insensitive)",
      "answer": "stack",
      "points": 1,
      "type": "text"
    },
    {
      "q": "When verifying if brackets are balanced in the first clue ''((Secret)(Safe))'', what should you do each time a closing bracket '')'' appears? (case insensitive)",
      "answer": "pop",
      "points": 1,
      "type": "text"
    },
    {
      "q": "After processing all brackets in ''((Secret)(Safe))'', will your data structure be empty or not empty? (case insensitive)",
      "answer": "empty",
      "points": 1,
      "type": "text"
    },
    {
      "q": "If there are n characters in a message, what is the time complexity of reversing it using this data structure? (case insensitive)",
      "answer": "O(n)",
      "points": 1,
      "type": "text"
    },
    {
      "q": "In the third clue ''!dlroW olleH'', you add each character one by one into your data structure, and then remove them one by one to rebuild the original message. What decoded message do you finally get? (type exactly, case sensitive for this one)",
      "answer": "Hello World!",
      "points": 1,
      "type": "text"
    }
  ]',
  5
),
(
  'case_2',
  'The Queue Conundrum',
  'A bank robbery has occurred, and witnesses remember the order in which suspects entered and left the building. Your task is to use queue logic to track the sequence and identify the culprit. The evidence is in the order!',
  NOW() + INTERVAL '2 days',
  '[
    {
      "q": "In a queue data structure, which principle is followed?",
      "options": ["LIFO", "FIFO", "LILO", "Random"],
      "answer": 1,
      "points": 1,
      "type": "mcq"
    },
    {
      "q": "What is the time complexity of enqueue operation?",
      "options": ["O(n)", "O(1)", "O(log n)", "O(n log n)"],
      "answer": 1,
      "points": 1,
      "type": "mcq"
    },
    {
      "q": "In a circular queue, what happens when rear reaches the end?",
      "options": ["Queue is full", "It wraps around to the beginning", "Error occurs", "Queue is deleted"],
      "answer": 1,
      "points": 1,
      "type": "mcq"
    },
    {
      "q": "Which operation removes an element from the queue?",
      "options": ["Enqueue", "Dequeue", "Push", "Pop"],
      "answer": 1,
      "points": 1,
      "type": "mcq"
    },
    {
      "q": "What is a double-ended queue called?",
      "options": ["Stack", "Deque", "Priority Queue", "Circular Queue"],
      "answer": 1,
      "points": 1,
      "type": "mcq"
    }
  ]',
  5
),
(
  'case_3',
  'The Binary Search Mystery',
  'A suspect is hiding in one of 1000 numbered rooms. You can only ask ""Is the suspect in room X or higher?"" Use your knowledge of binary search to find them in the minimum number of questions!',
  NOW() + INTERVAL '4 days',
  '[
    {
      "q": "What is the time complexity of binary search?",
      "options": ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
      "answer": 1,
      "points": 1,
      "type": "mcq"
    },
    {
      "q": "Binary search requires the array to be:",
      "options": ["Unsorted", "Sorted", "Reversed", "Empty"],
      "answer": 1,
      "points": 1,
      "type": "mcq"
    },
    {
      "q": "In binary search, what do we do if the middle element is greater than the target?",
      "options": ["Search the right half", "Search the left half", "Return middle", "Start over"],
      "answer": 1,
      "points": 1,
      "type": "mcq"
    },
    {
      "q": "How many comparisons are needed to search in an array of 32 elements (worst case)?",
      "options": ["32", "16", "5", "6"],
      "answer": 2,
      "points": 1,
      "type": "mcq"
    },
    {
      "q": "Binary search can be applied to:",
      "options": ["Linked lists only", "Arrays only", "Both sorted arrays and BSTs", "Unsorted data"],
      "answer": 2,
      "points": 1,
      "type": "mcq"
    }
  ]',
  5
);
