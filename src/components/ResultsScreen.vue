<template>
  <div class="results-screen">
    <button
      class="toggle-buttons-button"
      @click="toggleButtonsVisible"
      :aria-label="buttonsVisible ? 'Hide buttons' : 'Show buttons'"
    >
      {{ buttonsVisible ? "👆" : "👇" }}
    </button>

    <div v-if="buttonsVisible" class="action-buttons top-buttons">
      <button @click="tryAgain" class="action-button try-again">
        Tentar Novamente
      </button>
      <button @click="nextWord" class="action-button next-word">
        Próxima Palavra
      </button>
      <button @click="goHome" class="action-button home-button">Ínicio</button>
    </div>

    <div
      class="results-container"
      :class="{ 'fullscreen-view': !buttonsVisible }"
    >
      <h2 class="results-title">
        <span v-if="isLoading">Analisando...</span>
        <span v-else>Seu Resultado</span>
      </h2>

      <div v-if="!isLoading" class="results-card" v-show="buttonsVisible">
        <h3 class="card-title">Resultado:</h3>
        <div class="result-content">
          <p v-if="isCorrect" class="correct-message">
            ✅ Perfeito! Você desenhou um(a)
            <span class="highlight">{{ word }}</span>
          </p>
          <p v-else class="ai-guess">
            🤖 O IA advinhou: <span class="guess">{{ aiGuess }}</span>
          </p>
          <div class="confidence-badge" :class="confidence.toLowerCase()">
            {{ confidenceEmoji }} {{ confidenceText }}
          </div>
        </div>
      </div>

      <div class="cards-row">
        <div class="word-card" v-show="buttonsVisible">
          <h3 class="card-title">A Palavra era:</h3>
          <p class="word">{{ word }}</p>
          <button
            @click="playAudio"
            class="audio-button"
            aria-label="Play word audio"
          >
            🔊 Escutar
          </button>
        </div>

        <div class="drawing-card">
          <h3 class="card-title">Seu Desenho:</h3>
          <div class="drawing-wrapper">
            <img :src="drawingData" alt="Your drawing" class="drawing-image" />
            <div v-if="isLoading" class="loading-overlay">
              <div class="spinner"></div>
              <p>AI is analyzing...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ResultsScreen",
  data() {
    return {
      buttonsVisible: true,
    };
  },
  props: {
    word: String,
    drawingData: String,
    aiGuess: String,
    isCorrect: Boolean,
    confidence: {
      type: String,
      default: "medium",
      validator: (value) =>
        ["high", "medium", "low", "error"].includes(value?.toLowerCase()),
    },
    isLoading: Boolean,
  },
  computed: {
    confidenceEmoji() {
      const emojis = {
        high: "🎯",
        medium: "🤔",
        low: "🫤",
        error: "❌",
      };
      return emojis[this.confidence?.toLowerCase()] || "❓";
    },
    confidenceText() {
      return `Confiança: ${
        this.confidence.charAt(0).toUpperCase() + this.confidence.slice(1)
      }`;
    },
  },
  methods: {
    toggleButtonsVisible() {
      this.buttonsVisible = !this.buttonsVisible;
    },
    playAudio() {
      this.$emit("play-audio");
    },
    tryAgain() {
      this.$emit("retry");
    },
    nextWord() {
      this.$emit("next-word");
    },
    goHome() {
      this.$emit("go-home");
    },
  },
};
</script>

<style scoped>
.results-screen {
  position: relative;
  padding: 16px;
  min-height: 100vh;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
}

.toggle-buttons-button {
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 200;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #ddd;
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 0.9rem;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.toggle-buttons-button:hover {
  background: white;
  transform: scale(1.05);
}

/* Fullscreen View */
.fullscreen-view .drawing-card {
  max-width: 100%;
  margin: 40px auto 0;
}

.fullscreen-view .drawing-image {
  max-height: 75vh;
}

.top-buttons {
  margin-bottom: 20px;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  width: 100%;
  max-width: 800px;
  margin: 0 auto 20px;
  transition: all 0.3s ease;
}

.action-button {
  padding: 14px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.try-again {
  background: #ffd166;
  color: #333;
}

.next-word {
  background: #06d6a0;
  color: white;
}

.home-button {
  background: #3d5a80;
  color: white;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.results-container {
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
  transition: all 0.3s ease;
}

.results-title {
  color: #118ab2;
  font-size: 1.8rem;
  text-align: center;
  margin-bottom: 24px;
}

.cards-row {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
}

.word-card,
.drawing-card {
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.drawing-wrapper {
  position: relative;
  margin-top: 12px;
}

.drawing-image {
  width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: 8px;
  border: 2px solid #eee;
  transition: all 0.3s ease;
}

.results-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.card-title {
  color: #3d5a80;
  font-size: 1.2rem;
  margin-bottom: 12px;
}

.word {
  font-size: 1.8rem;
  font-weight: bold;
  color: #073b4c;
  margin: 12px 0;
  text-transform: capitalize;
}

.audio-button {
  background: #3d5a80;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}

.audio-button:hover {
  background: #2a4365;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(6, 214, 160, 0.2);
  border-top-color: #06d6a0;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.result-content {
  margin-top: 16px;
}

.correct-message {
  color: #06d6a0;
  font-size: 1.2rem;
  margin-bottom: 12px;
}

.highlight {
  font-weight: bold;
}

.ai-guess {
  color: #073b4c;
  font-size: 1.2rem;
  margin-bottom: 12px;
}

.guess {
  color: #118ab2;
  font-weight: bold;
  text-transform: capitalize;
}

.confidence-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  margin-top: 8px;
}

.confidence-badge.high {
  background-color: rgba(6, 214, 160, 0.2);
  color: #06d6a0;
}

.confidence-badge.medium {
  background-color: rgba(255, 209, 102, 0.2);
  color: #ff9e00;
}

.confidence-badge.low {
  background-color: rgba(239, 71, 111, 0.2);
  color: #ef476f;
}

.confidence-badge.error {
  background-color: rgba(108, 117, 125, 0.2);
  color: #6c757d;
}

@media (min-width: 768px) {
  .cards-row {
    flex-direction: row;
  }

  .word-card,
  .drawing-card {
    min-width: 0;
  }

  .fullscreen-view .drawing-card {
    max-width: 800px;
  }
}

@media (max-width: 600px) {
  .action-buttons {
    grid-template-columns: 1fr;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #f5f7fa;
    padding: 10px;
    z-index: 100;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    margin-bottom: 0;
  }

  .toggle-buttons-button {
    top: auto;
    bottom: 70px;
    right: 10px;
  }

  .results-title {
    font-size: 1.5rem;
  }

  .word {
    font-size: 1.5rem;
  }

  .fullscreen-view .drawing-image {
    max-height: 65vh;
  }

  .cards-row {
    margin-top: 15px;
  }
}
</style>
