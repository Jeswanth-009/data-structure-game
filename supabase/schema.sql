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

-- Create admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id),
  case_id TEXT NOT NULL REFERENCES cases(id),
  answers JSONB NOT NULL,
  score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  reviewed_by UUID REFERENCES admin_users(id),
  reviewed_at TIMESTAMPTZ,
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

-- Create index on submissions for admin review
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_player ON submissions(player_id);
CREATE INDEX IF NOT EXISTS idx_submissions_case ON submissions(case_id);

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
      "q": "From the hacker''s note — Which data structure is he using?",
      "answer": "Stack",
      "points": 1,
      "type": "text"
    },
    {
      "q": "When verifying if brackets are balanced in the first clue ''((Secret)(Safe))'', what should you do each time a closing bracket '')'' appears?",
      "answer": "Pop",
      "points": 1,
      "type": "text"
    },
    {
      "q": "After processing all brackets in ''((Secret)(Safe))'', will your data structure be empty or not empty?",
      "answer": "Empty",
      "points": 1,
      "type": "text"
    },
    {
      "q": "If there are n characters in a message, what is the time complexity of reversing it using this data structure?",
      "answer": "O(n)",
      "points": 1,
      "type": "text"
    },
    {
      "q": "In the third clue ''!dlroW olleH'', you add each character one by one into your data structure, and then remove them one by one to rebuild the original message. What decoded message do you finally get?",
      "answer": "Hello World!",
      "points": 1,
      "type": "text"
    }
  ]',
  5
),
(
  'case_2',
  'The Priority Predicament',
  'In the bustling city of AlgoTown, the Emergency Control Center receives hundreds of alerts every hour — fire alarms, medical emergencies, lost pets, even traffic jams. One morning, the system fails. All alerts start getting handled in the wrong order — minor ones first, and critical ones much later! The technician on duty, Officer Ray, reports: "We had a system that always took the most important alert first... but someone replaced it with one that just handles them in arrival order!" Now the city''s response team is in chaos. Your mission: restore order by rebuilding the correct handling system and understanding which data structure ensures the most urgent alerts are processed first.',
  NOW(),
  '[
    {
      "q": "Which data structure allows you to always process the highest-priority element first, even if it didn''t arrive first?",
      "answer": "Priority Queue",
      "points": 1,
      "type": "text"
    },
    {
      "q": "If alerts are sorted by priority from highest to lowest, what sorting algorithm could efficiently handle this in O(n log n) time?",
      "answer": "Heap Sort",
      "points": 1,
      "type": "text"
    },
    {
      "q": "In a Priority Queue implemented using a binary heap, what is the time complexity of inserting a new alert?",
      "answer": "O(log n)",
      "points": 1,
      "type": "text"
    },
    {
      "q": "If the system used a simple Queue (FIFO) instead of a Priority Queue, what would be the time complexity to find and remove the highest-priority alert each time (without sorting)?",
      "answer": "O(n)",
      "points": 1,
      "type": "text"
    },
    {
      "q": "The city upgrades its system to a Dynamic Priority Queue that can increase or decrease the priority of alerts in real-time. Which advanced data structure can support such operations efficiently?",
      "answer": "Fibonacci Heap",
      "points": 1,
      "type": "text"
    },
    {
      "q": "What is the data structure used internally by a Priority Queue in most programming languages (like Java or Python)?",
      "answer": "Heap",
      "points": 1,
      "type": "text"
    },
    {
      "q": "In a min-heap, what element is always found at the top?",
      "answer": "Minimum",
      "points": 1,
      "type": "text"
    }
  ]',
  7
),
(
  'case_3',
  'The Network Nexus',
  'A mysterious blackout hits Tech City. The entire power network—a web of stations connected by underground cables—has partially failed. Engineer-detective Aria Volt arrives at the Control Hub. Each power station is represented as a node, and cables as connections. On the system map, she sees: Station A → connected to B and C, Station B → connected to D, Station C → connected to D and E, Station D → connected to F, Station E → connected to F. The main power source (A) still works—but several districts at Station F have no electricity. Your task: help Aria trace the fastest way electricity can flow again.',
  NOW(),
  '[
    {
      "q": "What type of data structure represents stations and their cable connections?",
      "answer": "Graph",
      "points": 1,
      "type": "text"
    },
    {
      "q": "Aria needs to explore all directly connected stations first, then their neighbors, and so on—until she reaches F. Which graph traversal algorithm should she use?",
      "answer": "Breadth-First Search",
      "points": 1,
      "type": "text"
    },
    {
      "q": "To implement this exploration level-by-level, which data structure should she use to store the stations to visit next?",
      "answer": "Queue",
      "points": 1,
      "type": "text"
    },
    {
      "q": "If there are V stations (vertices) and E cables (edges), what is the time complexity of this traversal?",
      "answer": "O(V + E)",
      "points": 1,
      "type": "text"
    },
    {
      "q": "Suppose the cables have different lengths instead of all being equal. Which algorithm should Aria use instead to find the shortest path from A to F?",
      "answer": "Dijkstra''s Algorithm",
      "points": 1,
      "type": "text"
    }
  ]',
  5
),
(
  'case_4',
  'The Treasure Trail',
  'In the desert valley of Algoa, explorer Rhea Quest is on a mission to find the Golden Vault — a legendary treasure hidden deep inside a chain of ancient caves. Each cave offers some gold coins but consumes a certain amount of energy to enter. Rhea starts with K units of energy and must decide which caves to visit to collect the maximum gold before her energy runs out. Her mentor''s old journal reads: "You cannot explore every path. Choose wisely — and remember, small steps solved first lead to great success."',
  NOW(),
  '[
    {
      "q": "The problem of maximizing gold within a limited energy capacity is similar to which well-known algorithmic problem?",
      "answer": "Knapsack",
      "points": 1,
      "type": "text"
    },
    {
      "q": "The journal''s advice — ''Solve smaller problems first; combine them wisely to solve the big one'' — represents which concept used in solving optimization problems?",
      "answer": "Dynamic",
      "points": 1,
      "type": "text"
    },
    {
      "q": "Rhea notices she faces the same smaller energy-gold combinations repeatedly. What key property allows her to reuse previous results instead of recalculating them?",
      "answer": "Overlapping",
      "points": 1,
      "type": "text"
    },
    {
      "q": "For N caves and total energy K, what is the time complexity of the bottom-up table-based solution?",
      "answer": "O(NK)",
      "points": 1,
      "type": "text"
    },
    {
      "q": "If some caves restore energy instead of consuming it, what algorithm would handle finding the best path correctly?",
      "answer": "BellmanFord",
      "points": 1,
      "type": "text"
    }
  ]',
  5
),
(
  'case_5',
  'The Mirror Maze Mystery',
  'Deep inside the Mirror Maze of AlgoRealm, detective Nova Trace chases a digital illusionist — The Recurser. Every corridor looks identical, yet slightly smaller than the last, looping endlessly like a reflection inside a reflection. A cryptic message flickers on the neon wall: "To find me, you must first find my smaller self." Nova realizes — each mirror contains half the maze, and within that, half again, until only a single room remains. The maze map flashes: Level 1 → 2 mirrors, Level 2 → 4 mirrors, Level 3 → 8 mirrors... The pattern seems infinite — but the detective knows there must be a base case that ends the recursion, or she''ll be lost forever.',
  NOW(),
  '[
    {
      "q": "When a function calls itself with a smaller version of the same problem, what is this concept called?",
      "answer": "Recursion",
      "points": 1,
      "type": "text"
    },
    {
      "q": "In recursion, what condition stops the function from calling itself forever?",
      "answer": "Base Case",
      "points": 1,
      "type": "text"
    },
    {
      "q": "If the maze keeps dividing into two smaller mazes until only one remains, how many recursive calls are made for a maze of size n?",
      "answer": "O(n)",
      "points": 1,
      "type": "text"
    },
    {
      "q": "If Nova divides the maze in half each time — just like Merge Sort splits an array — what is the overall time complexity of her search?",
      "answer": "O(n log n)",
      "points": 1,
      "type": "text"
    },
    {
      "q": "If each mirror level doubles the number of reflections, what mathematical sequence describes the total number of rooms explored?",
      "answer": "Geometric Progression",
      "points": 1,
      "type": "text"
    },
    {
      "q": "In recursion, what is the opposite approach where you start from the smallest subproblem and build up to the final solution?",
      "answer": "Iteration",
      "points": 1,
      "type": "text"
    },
    {
      "q": "If Nova breaks every mirror after visiting it, what kind of recursion does this represent — top-down or bottom-up?",
      "answer": "Top-down",
      "points": 1,
      "type": "text"
    }
  ]',
  7
),
(
  'case_6',
  'The Chain of Clues',
  'Detective Rian Linker receives a strange USB drive containing a file named: "chain_start.dat". When he opens it, he doesn''t find a document — he finds a series of records. Each record contains two things: A clue number, and A pointer to the next clue''s address. But some records have their "next clue" set to NULL, and one file seems to loop back to an earlier one — forming an endless cycle! Rian must trace the entire chain to uncover the final hidden message, but he must be careful — if he follows a circular path, he could be trapped forever.',
  NOW(),
  '[
    {
      "q": "What data structure is being described here, where each element stores data and a pointer to the next element?",
      "answer": "Linked List",
      "points": 1,
      "type": "text"
    },
    {
      "q": "If each clue points to the next clue, how do you access the 5th clue starting from the first?",
      "answer": "Traversal",
      "points": 1,
      "type": "text"
    },
    {
      "q": "When Rian finds that a clue points back to a previous clue instead of NULL, what structure does this form?",
      "answer": "Cycle",
      "points": 1,
      "type": "text"
    },
    {
      "q": "Which algorithm can Rian use to detect if such a cycle exists in the linked list efficiently (without using extra space)?",
      "answer": "Floyd''s Cycle Detection Algorithm",
      "points": 1,
      "type": "text"
    },
    {
      "q": "What is the time complexity of traversing a linked list with n nodes once?",
      "answer": "O(n)",
      "points": 1,
      "type": "text"
    },
    {
      "q": "What will happen if you try to access the ''next'' pointer of the last node (NULL)?",
      "answer": "Error",
      "points": 1,
      "type": "text"
    },
    {
      "q": "If Rian needs to reverse the chain of clues so the last becomes first, which operations will he perform repeatedly?",
      "answer": "Pointer Reversal",
      "points": 1,
      "type": "text"
    }
  ]',
  7
);

-- Insert admin users (password: admin123 - hashed with bcrypt)
-- In production, use proper password hashing
INSERT INTO admin_users (username, password_hash) VALUES
('admin1', '$2a$10$rXK5X8BqGqJxJqE8qKp5xOZYqF5qhX8qZ8qKp5xOZYqF5qhX8qZ8q'),
('admin2', '$2a$10$rXK5X8BqGqJxJqE8qKp5xOZYqF5qhX8qZ8qKp5xOZYqF5qhX8qZ8q')
ON CONFLICT (username) DO NOTHING;
