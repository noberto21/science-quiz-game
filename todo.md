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


## Hint System
- [x] Add hint logic to eliminate incorrect options
- [x] Create hint UI button on quiz screen
- [x] Implement hint usage tracking per question
- [x] Apply score penalty for using hints
- [x] Display hint feedback to player
- [x] Test hint system functionality


## Statistics Dashboard
- [x] Update game_sessions table to track game duration
- [x] Create statistics aggregation queries
- [x] Create backend procedures for accuracy rates
- [x] Create backend procedures for fastest times
- [x] Create backend procedures for category performance
- [x] Build statistics dashboard UI
- [x] Add statistics link to navigation
- [x] Test statistics calculations


## Scoring System Update
- [x] Update score to award 5 points per correct answer
- [x] Update hint penalty to 2 points
- [x] Test scoring calculations
- [x] Update statistics calculations


## Subject Selection & Game Rename
- [x] Create subject selection screen component
- [x] Update game flow to include subject selection before quiz
- [x] Rename game title to "Lacon Quiz Game"
- [x] Update all UI text references to new game name
- [x] Test subject selection flow


## Bug Fixes
- [x] Fix Chemistry and Biology selections routing to Math


## Score Update Bug
- [x] Fix score not updating after correct answers


## Play Another Subject Feature
- [x] Add 'Play Another Subject' button to EndScreen
- [x] Implement navigation back to subject selection
- [x] Clear game session data when starting new subject
- [x] Test subject switching flow


## Game Flow Bug
- [x] Fix game automatically progressing to next subject instead of showing EndScreen


## Navigation Bug
- [x] Fix 404 error on "Play Another Subject" button click
