<template>
  <div class="popup-overlay">
    <div class="word-popup" :class="difficulty">
      <h2>Sua Palavra é</h2>

      <div class="content-wrapper">
        <!-- Word Display (hidden in hard mode) -->
        <div class="word-display" v-if="difficulty !== 'hard'">
          {{ currentWord }}
        </div>

        <!-- Image Hint (Easy only) -->
        <img
          v-if="difficulty === 'easy'"
          :src="getWordImage(currentWord)"
          class="word-image"
          :alt="`Picture of ${currentWord}`"
        />

        <!-- Audio Player -->
        <button class="audio-button" @click="playAudio">
          Escutar
          <span class="audio-icon">🔊</span>
        </button>
      </div>

      <!-- Centered "Got it!" button -->
      <div class="button-wrapper">
        <button class="close-button" @click="close">Vamos la!</button>
      </div>
    </div>
  </div>
</template>

<script>
import words from "@/assets/words.json";

export default {
  name: "WordPopup",
  props: {
    difficulty: {
      type: String,
      required: true,
      validator: (value) => ["easy", "medium", "hard"].includes(value),
    },
    currentWord: {
      type: String,
      required: true,
    },
  },
  methods: {
    getWordImage(word) {
      const foundWord = words.words.find((w) => w.word === word.toLowerCase());
      return foundWord ? foundWord.image : "";
    },
    getWordAudio(word) {
      const foundWord = words.words.find((w) => w.word === word.toLowerCase());
      return foundWord ? foundWord.audio : "";
    },
    playAudio() {
      const audio = new Audio(this.getWordAudio(this.currentWord));
      audio.play().catch((e) => console.log("Audio play failed:", e));
    },
    close() {
      this.$emit("close");
    },
  },
};
</script>

<style scoped>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
}

.word-popup {
  background: white;
  padding: 25px;
  border-radius: 15px;
  text-align: center;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  animation: popIn 0.3s ease-out;
  display: flex;
  flex-direction: column;
  min-height: 200px;
}

.word-popup.easy {
  min-height: 350px;
}

.word-popup.medium {
  min-height: 250px;
}

.word-popup.hard {
  min-height: 200px;
  padding-bottom: 15px;
}

@keyframes popIn {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 15px;
}

.word-popup.hard .content-wrapper {
  gap: 10px;
}

.word-display {
  font-size: 2.5rem;
  font-weight: bold;
  color: #2c3e50;
  margin: 10px 0;
  text-transform: capitalize;
}

.word-image {
  max-width: 200px;
  max-height: 200px;
  margin: 0 auto;
  display: block;
  border-radius: 8px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
}

.audio-button {
  background: #3498db;
  color: white;
  border: none;
  padding: 12px 25px;
  font-size: 1.2rem;
  border-radius: 30px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s;
  margin: 0 auto;
  width: fit-content;
}

.audio-button:hover {
  background: #2980b9;
  transform: scale(1.05);
}

.button-wrapper {
  margin-top: 10px;
  display: flex;
  justify-content: center;
}

.word-popup.hard .button-wrapper {
  margin-top: 5px;
}

.close-button {
  background: #2ecc71;
  color: white;
  border: none;
  padding: 12px 30px;
  font-size: 1.1rem;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.2s;
  width: fit-content;
}

.close-button:hover {
  background: #27ae60;
  transform: scale(1.05);
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .word-popup {
    padding: 20px;
  }

  .word-popup.easy {
    min-height: 300px;
  }

  .word-popup.medium {
    min-height: 220px;
  }

  .word-popup.hard {
    min-height: 180px;
    padding-bottom: 10px;
  }

  .word-display {
    font-size: 2rem;
  }

  .word-image {
    max-width: 150px;
  }
}
</style>