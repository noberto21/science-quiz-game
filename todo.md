# Science Quiz Game TODO

## Database Schema
- [x] Create categories table
- [x] Create questions table with options and correct answers
- [x] Create game_sessions table for user progress tracking
- [x] Seed database with Math questions (Easy, Medium, Hard)
- [x] Seed database with Chemistry questions (Easy, Medium, Hard)
- [x] Seed database with Biology questions (Easy, Medium, Hard)

## Backend API (tRPC)
- [x] Create procedure to start new game session
- [x] Create procedure to fetch random question by category and difficulty
- [x] Create procedure to submit answer and update score
- [x] Create procedure to get current game state
- [x] Create procedure to end game and get final score

## Frontend - Design System
- [x] Set up Memphis-inspired color palette (peach, mint, lilac, yellow)
- [x] Configure bold uppercase sans-serif typography
- [x] Create geometric background decorations component
- [x] Style buttons with Memphis aesthetic

## Frontend - Screens
- [x] Build Start screen with title, Start Game button, and Exit button
- [x] Build Quiz screen with question display
- [x] Build Quiz screen with four multiple-choice options (A-D)
- [x] Display current score on Quiz screen
- [x] Display current difficulty level on Quiz screen
- [x] Display current category on Quiz screen
- [x] Build End screen with final score display
- [x] Add navigation between screens

## Game Logic
- [x] Implement game state management (category, difficulty, score)
- [x] Implement answer validation logic
- [x] Implement automatic difficulty progression (Easy → Medium → Hard)
- [x] Implement automatic category switching after completing all difficulties
- [x] Implement game completion detection
- [x] Add smooth transitions between questions

## Testing & Polish
- [x] Test complete gameplay flow
- [x] Test all three categories
- [x] Test all three difficulty levels
- [x] Verify score tracking accuracy
- [x] Add loading states
- [x] Add error handling


## Sound Effects & Animations
- [x] Create audio utility for playing sounds
- [x] Add correct answer sound effect
- [x] Add incorrect answer sound effect
- [x] Create celebration animation for correct answers
- [x] Create shake animation for incorrect answers
- [x] Integrate sounds into QuizScreen
- [x] Integrate animations into QuizScreen
- [x] Test sound and animation playback
