# Free Sets

## Overview

Free Sets is a mathematical puzzle game that challenges players to create enclosures on a game board and distribute marbles in a way that creates sum-free-sets (or variations on the concept). The game combines elements of geometry, probability, and number theory, offering an engaging experience where strategy and mathematical thinking are key to success.

In Free Sets, you draw shapes on a board to create enclosures, then release marbles that bounce around randomly. Your goal is to stop the simulation when the marbles are distributed in a way that creates a type of "free set" - where the counts of marbles in each partition follow special mathematical rules depending on the game mode you've chosen.

As you progress through rounds, the challenge increases with more marbles and required enclosures, testing your ability to create optimal distributions.

## Game Modes

- Two distinct game modes:
  - **Sum Free Set**: Create enclosures whose marble counts are the elements of S such that the elements of S + S are not found in S (in simpler terms: no marble count can be the sum of any two counts in your set)
  - **Poisson**: Create enclosures whose marble counts are the elements of S such that the elements of Poisson(S + S) are not found in S (in simpler terms: no marble count can match the random numbers drawn from Poisson distributions where each distribution's parameter equals a sum of your counts)

## Game Rules

### Getting Started

1. Select your game mode
2. The game begins with a blank canvas
3. Round 1 has 12 marbles

### Basic Gameplay

1. **Drawing Phase**:
   - Draw disjoint enclosures (shapes) on the game board by clicking and dragging
   - Each round requires drawing one more enclosure than the previous round
   - Enclosures cannot overlap with each other

2. **Simulation Phase**:
   - Start the simulation to watch marbles move around the board
   - Marbles bounce off walls and move through each other
   - Stop the simulation when you think the distribution of marbles is optimal

3. **Checking Phase**:
   - After stopping the simulation, the game calculates the number of marbles in each enclosure
   - The game checks if your set of marble counts satisfies the win condition for your selected mode

4. **Round Progression**:
   - Upon winning a round, you advance to the next round with:
     - More marbles (6 additional marbles per round)
     - One additional enclosure to draw

## Development

This game was built using:
- React
- TypeScript
- HTML Canvas
- Vite

## How to Run

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

randomplayables@proton.me