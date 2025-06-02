<template>
  <div id="app">
    <!-- Home Screen -->
    <HomeScreen
      v-if="currentScreen === 'home'"
      @start-game="currentScreen = 'level'"
    />

    <!-- Level Selection -->
    <LevelScreen
      v-else-if="currentScreen === 'level'"
      @go-back="currentScreen = 'home'"
      @level-selected="startGame"
    />

    <!-- Game Screen -->
    <GameScreen
      v-else-if="currentScreen === 'game'"
      :difficulty="currentDifficulty"
      @go-home="goHome"
      @finished="handleGameFinished"
    />
  </div>
</template>

<script>
import HomeScreen from "./components/HomeScreen.vue";
import LevelScreen from "./components/LevelScreen.vue";
import GameScreen from "./components/GameScreen.vue";
import ResultsScreen from "./components/ResultsScreen.vue";

export default {
  name: "App",
  components: { HomeScreen, LevelScreen, GameScreen },
  data() {
    return {
      currentScreen: "home", // Can be 'home', 'level', or 'game'
      currentDifficulty: "", // Will be 'easy', 'medium', or 'hard'
    };
  },
  methods: {
    startGame(difficulty) {
      this.currentDifficulty = difficulty;
      this.currentScreen = "game";
    },
    goHome() {
      this.currentScreen = "home";
      this.currentDifficulty = "";
    },
    handleGameFinished(result) {
      if (result.isCorrect) {
        console.log("AI guessed correctly!", result.aiGuess);
      } else {
        console.log(`AI thought you drew: ${result.aiGuess}`);
      }
    },
  },
};
</script>

<style>
/* Global Styles */
#app {
  font-family: "Comic Sans MS", cursive, sans-serif;
  text-align: center;
  color: #2c3e50;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: #f5f7fa;
}

/* Smooth transitions between screens */
.screen-transition-enter-active,
.screen-transition-leave-active {
  transition: opacity 0.3s ease;
}
.screen-transition-enter-from,
.screen-transition-leave-to {
  opacity: 0;
}
</style>
