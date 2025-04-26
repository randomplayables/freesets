# Die Sum Free
Play Free Sets in real life using dice.

## Overview

Free Sets is a mathematical probability game based on number theory. This real-life version uses dice to create sets of numbers that must follow specific mathematical properties. The core challenge is to create a "sum-free set" - a collection of numbers where no number in the set equals the sum of any two numbers in the set (including a number with itself).

## Materials Needed

- Several standard six-sided dice:
- Paper and pen for keeping score

## Game Rules

### Basic Concept

In each round, you'll roll a set of dice. The unique values showing on the dice form your set S. You win the round if S is "sum-free" - meaning no number in S equals the sum of any two numbers in S (including a number with itself). You gain a point for each round that you survive.

### Round Progression

1. **Round 1:** Roll 2 dice
2. **Round 2:** Roll 3 dice
3. **Round 3:** Roll 4 dice
   ...and so on, adding one more die each round

### Detailed Gameplay

1. **Rolling the Dice:**
   - Roll all dice for the current round at once
   - The face-up values form your initial set

2. **Determining Your Set S:**
   - If multiple dice show the same number, count that number only once
   - For example, if you roll [3, 3, 5], your set S is {3, 5}

3. **Checking if S is Sum-Free:**
   - Calculate all possible sums of numbers in S (including a number with itself)
   - Check if any of these sums also appear in S
   - If no sum appears in S, then S is sum-free and you win the round
   - If any sum appears in S, then S is not sum-free and you lose the round

4. **Failed Round:**
   - If you fail a round, you lose.

5. **Advancing:**
   - After surviving a round, add one more die and proceed to the next round
   - Try to complete as many rounds as you can.

### Example Round

**Round 1:**
1. Roll 2 dice: You get a 2 and a 5
2. Your set S is {2, 5}
3. Calculate all possible sums:
   - 2+2 = 4
   - 2+5 = 7
   - 5+5 = 10
4. Check if any of these sums (4, 7, 10) appear in S = {2, 5}
5. None of them do, so S is sum-free
6. You win Round 1 and advance to Round 2!

**Round 2:**
1. Roll 3 dice: You get a 3, a 3, and a 6
2. Your set S is {3, 6} (counting 3 only once)
3. Calculate all possible sums:
   - 3+3 = 6
   - 3+6 = 9
   - 6+6 = 12
4. Check if any of these sums (6, 9, 12) appear in S = {3, 6}
5. 6 appears in S, so S is not sum-free
6. You lose!

## Scoring

Score 1 point for each round you complete successfully

## Strategy Tips

1. **Recognize Common Patterns:**
   - Sets containing only odd numbers (1, 3, 5) are always sum-free
   - Sets where all possible pairwise sums exceed 6 are guaranteed sum-free with standard dice (e.g., {4, 5, 6})
   - Sets where all pairwise sums exceed the maximum value in the set itself are always sum-free (e.g., in {2, 3}, the max is 3, and all sums exceed 3)


2. **Watch Out For:**
   - If your set contains both a and 2a (like 3 and 6), it cannot be sum-free
   - Small numbers like 1 and 2 often cause problems in larger sets

Enjoy exploring the fascinating world of sum-free sets!

