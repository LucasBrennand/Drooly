<template>
  <div class="game-screen">
    <!-- Word Reveal Popup -->
    <WordPopup
      v-if="showWordPopup"
      :difficulty="difficulty"
      :currentWord="currentWord"
      @close="startDrawingRound(false)"
    />

    <!-- Results Screen -->
    <ResultsScreen
      v-if="showResultsScreen"
      :word="currentWord"
      :drawingData="capturedDrawing"
      :aiGuess="aiResults?.guess"
      :isCorrect="aiResults?.isCorrect"
      :confidence="aiResults?.confidence"
      :isLoading="isLoadingResults"
      @play-audio="playAudio"
      @go-home="goHome"
      @retry="handleRetry"
      @next-word="handleNextWord"
      @change-level="handleChangeLevel"
    />

    <!-- Top Toolbar -->
    <div class="top-toolbar">
      <div class="left-buttons">
        <button class="tool-button home" @click="goHome">🏠</button>
        <button
          class="tool-button menu"
          @click="toggleToolbar"
          :style="{ transform: showTools ? 'rotate(90deg)' : '' }"
        >
          🎨
        </button>
      </div>

      <button
        class="hint-button"
        @click="
          showHint();
          playSound('hint');
        "
        v-if="!showWordPopup"
        :class="{ pressed: hintPressed }"
        @mousedown="hintPressed = true"
        @mouseup="hintPressed = false"
        @mouseleave="hintPressed = false"
      >
        Mostrar Dica
      </button>
    </div>

    <!-- Confirmation Popup -->
    <div class="confirmation-popup" v-if="showConfirmation">
      <div class="popup-content">
        <h3>Você terminou de desenhar?</h3>
        <p>Não pode mudar nada depois de terminar!</p>
        <div class="popup-buttons">
          <button class="confirm-button" @click="confirmFinished">
            Sim, terminei!
          </button>
          <button class="cancel-button" @click="cancelFinished">
            Não, quero continuar desenhando
          </button>
        </div>
      </div>
    </div>

    <!-- Settings Popup -->
    <div class="settings-popup" v-if="showSettings">
      <div class="popup-content">
        <h3>Settings</h3>
        <div class="volume-control">
          <label for="volume-slider">Volume:</label>
          <input
            type="range"
            id="volume-slider"
            min="0"
            max="1"
            step="0.1"
            v-model.number="volume"
            @input="updateVolume"
          />
          <span class="volume-value">{{ Math.round(volume * 100) }}%</span>
        </div>
        <div class="popup-buttons">
          <button class="confirm-button" @click="closeSettings">Done</button>
        </div>
      </div>
    </div>

    <!-- Color Splash Animation -->
    <div class="color-splash" v-if="showSplash" :style="splashStyle"></div>

    <!-- Drawing Tools Palette -->
    <div
      class="tools-palette"
      v-if="showTools"
      :style="{ transform: `translateY(${bounceOffset}px)` }"
    >
      <div class="color-palette">
        <button
          v-for="color in colors"
          :key="color.name"
          class="color-button"
          :style="{
            backgroundColor: color.value,
            transform: lineColor === color.value ? 'scale(1.2)' : 'scale(1)',
          }"
          @click="setColor(color.value)"
          :title="color.name"
        ></button>
      </div>
      <div class="brush-controls">
        <button
          class="brush-size-button"
          @click="decreaseBrushSize"
          title="Smaller brush"
        >
          −
        </button>
        <span class="brush-size-display">{{ lineWidth }}px</span>
        <button
          class="brush-size-button"
          @click="increaseBrushSize"
          title="Larger brush"
        >
          +
        </button>
      </div>
      <button
        class="tool-button clear"
        @click="clearCanvas"
        title="Clear canvas"
      >
        🗑️
      </button>
      <button
        class="tool-button eraser"
        @click="setEraser"
        title="Eraser"
        :class="{ active: isEraser }"
      >
        🧽
      </button>
    </div>

    <!-- Drawing Canvas -->
    <canvas
      ref="drawingCanvas"
      class="drawing-area"
      v-show="!showWordPopup && !showResultsScreen && !showSettings"
      @mousedown="startDrawing"
      @mousemove="draw"
      @mouseup="stopDrawing"
      @mouseleave="stopDrawing"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="stopDrawing"
    ></canvas>

    <!-- Finished Button -->
    <button
      class="finish-button"
      @click="finishDrawing"
      v-show="!showWordPopup && !showResultsScreen && !showSettings"
    >
      Terminei!
    </button>
  </div>
</template>

<script>
import WordPopup from "./WordPopup.vue";
import ResultsScreen from "./ResultsScreen.vue";
import words from "@/assets/words.json";
import { analyzeDrawing } from "@/utils/ai-service";

export default {
  name: "GameScreen",
  components: { WordPopup, ResultsScreen },
  props: {
    difficulty: {
      type: String,
      required: true,
      validator: (value) => ["easy", "medium", "hard"].includes(value),
    },
  },
  data() {
    return {
      devicePixelRatio: 1,
      showWordPopup: true,
      showTools: false,
      showConfirmation: false,
      showSettings: false,
      showSplash: false,
      showResultsScreen: false,
      splashStyle: {},
      currentWord: "",
      capturedDrawing: null,
      soundOn: true,
      sounds: {
        button: new Audio("/sounds/button-click.mp3"),
        settings: new Audio("/sounds/settings-click.mp3"),
        hint: new Audio("/sounds/hint-click.mp3"),
        finish: new Audio("/sounds/finish-click.mp3"),
      },
      volume: 0.7,
      audioElements: [],
      isDrawing: false,
      isEraser: false,
      isLoadingResults: false,
      aiResults: null,
      canvasContext: null,
      lastX: 0,
      lastY: 0,
      lineColor: "#FF0000",
      lineWidth: 5,
      hintPressed: false,
      bounceOffset: 0,
      bounceDirection: 1,
      colors: [
        { name: "Brown", value: "#702f18" },
        { name: "Red", value: "#FF0000" },
        { name: "Blue", value: "#0000FF" },
        { name: "Green", value: "#00FF00" },
        { name: "Yellow", value: "#FFFF00" },
        { name: "Purple", value: "#800080" },
        { name: "Orange", value: "#FFA500" },
        { name: "Pink", value: "#FFC0CB" },
      ],
    };
  },
  mounted() {
    this.initGame();
    window.addEventListener("resize", this.handleResize);
    this.startBounceAnimation();

    const savedVolume = localStorage.getItem("volume");
    if (savedVolume) {
      this.volume = parseFloat(savedVolume);
    }
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
    cancelAnimationFrame(this.animationFrame);
  },
  methods: {
    initGame() {
      this.initCanvas();
      this.currentWord = this.selectRandomWord();
      this.showWordPopup = true;
    },
    initCanvas() {
      const canvas = this.$refs.drawingCanvas;
      this.$nextTick(() => {
        const container = canvas.parentElement;
        const width = container.clientWidth - 30;
        const height = container.clientHeight - 100;

        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        const devicePixelRatio = window.devicePixelRatio || 1;
        canvas.width = width * devicePixelRatio;
        canvas.height = height * devicePixelRatio;

        this.canvasContext = canvas.getContext("2d");
        this.canvasContext.scale(devicePixelRatio, devicePixelRatio);
        this.setDrawingStyle();
      });
    },
    startBounceAnimation() {
      const animate = () => {
        if (this.bounceOffset > 8) this.bounceDirection = -1;
        if (this.bounceOffset < -8) this.bounceDirection = 1;
        this.bounceOffset += this.bounceDirection * 0.8;
        if (this.showTools) {
          this.animationFrame = requestAnimationFrame(animate);
        }
      };
      animate();
    },
    handleResize() {
      this.initCanvas();
    },
    setDrawingStyle() {
      if (this.isEraser) {
        this.canvasContext.globalCompositeOperation = "destination-out";
        this.canvasContext.strokeStyle = "rgba(0,0,0,1)";
      } else {
        this.canvasContext.globalCompositeOperation = "source-over";
        this.canvasContext.strokeStyle = this.lineColor;
      }
      this.canvasContext.lineWidth = this.lineWidth;
      this.canvasContext.lineCap = "round";
      this.canvasContext.lineJoin = "round";
    },
    selectRandomWord() {
      const wordPool = words.words;
      const randomIndex = Math.floor(Math.random() * wordPool.length);
      return wordPool[randomIndex].word;
    },
    startDrawing(e) {
      this.isDrawing = true;
      const pos = this.getPosition(e);
      [this.lastX, this.lastY] = [pos.x, pos.y];

      this.canvasContext.beginPath();
      this.canvasContext.moveTo(this.lastX, this.lastY);

      this.canvasContext.arc(
        this.lastX,
        this.lastY,
        this.lineWidth / 2,
        0,
        Math.PI * 2
      );
      this.canvasContext.fillStyle = this.isEraser
        ? "rgba(0,0,0,1)"
        : this.lineColor;
      this.canvasContext.fill();
    },
    draw(e) {
      if (!this.isDrawing) return;

      const pos = this.getPosition(e);
      const ctx = this.canvasContext;

      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);

      [this.lastX, this.lastY] = [pos.x, pos.y];
    },
    stopDrawing() {
      if (this.isDrawing) {
        this.isDrawing = false;
        this.canvasContext.closePath();
      }
    },
    handleTouchStart(e) {
      e.preventDefault();
      const touch = e.touches[0];
      this.startDrawing({
        clientX: touch.clientX,
        clientY: touch.clientY,
      });
    },
    handleTouchMove(e) {
      e.preventDefault();
      const touch = e.touches[0];
      this.draw({
        clientX: touch.clientX,
        clientY: touch.clientY,
      });
    },
    getPosition(e) {
      const canvas = this.$refs.drawingCanvas;
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    },
    startDrawingRound(initialStart = false) {
      this.showWordPopup = false;
      if (initialStart) {
        this.clearCanvas();
      }
    },
    clearCanvas() {
      const canvas = this.$refs.drawingCanvas;
      this.canvasContext.clearRect(0, 0, canvas.width, canvas.height);
      this.isEraser = false;
      this.setDrawingStyle();
    },
    toggleToolbar() {
      this.playSound("settings");
      this.showTools = !this.showTools;
      if (this.showTools) {
        this.startBounceAnimation();
      }
    },
    setColor(color) {
      this.lineColor = color;
      this.isEraser = false;
      this.setDrawingStyle();

      this.showSplash = true;
      this.splashStyle = {
        background: color,
        left: `${Math.random() * 80 + 10}%`,
        top: `${Math.random() * 80 + 10}%`,
      };
      setTimeout(() => (this.showSplash = false), 1000);
    },
    setEraser() {
      this.isEraser = !this.isEraser;
      this.setDrawingStyle();
    },
    increaseBrushSize() {
      this.lineWidth = Math.min(this.lineWidth + 2, 20);
      this.setDrawingStyle();
    },
    decreaseBrushSize() {
      this.lineWidth = Math.max(this.lineWidth - 2, 2);
      this.setDrawingStyle();
    },
    toggleSound() {
      this.soundOn = !this.soundOn;
      if (this.soundOn) {
        this.updateVolume();
      } else {
        this.audioElements.forEach((audio) => {
          audio.volume = 0;
        });
      }
    },
    showHint() {
      this.playSound("hint");
      this.showWordPopup = true;
    },
    openSettings() {
      this.playSound("settings");
      this.showSettings = true;
    },
    closeSettings() {
      this.showSettings = false;
    },
    updateVolume() {
      localStorage.setItem("volume", this.volume);
      this.audioElements.forEach((audio) => {
        audio.volume = this.soundOn ? this.volume : 0;
      });
    },
    playAudio() {
      const audio = new Audio(this.getWordAudio(this.currentWord));
      audio.volume = this.soundOn ? this.volume : 0;
      this.audioElements.push(audio);

      audio.play().catch((e) => console.log("Audio play failed:", e));
      audio.onended = () => {
        this.audioElements = this.audioElements.filter((a) => a !== audio);
      };
    },
    playSound(type) {
      if (!this.soundOn) return;

      try {
        // Clone the audio element to allow multiple rapid plays
        const sound = this.sounds[type].cloneNode();
        sound.volume = this.volume;
        sound.play().catch((e) => console.log("Sound play prevented:", e));
      } catch (e) {
        console.log("Sound error:", e);
      }
    },
    getWordAudio(word) {
      const foundWord = words.words.find((w) => w.word === word.toLowerCase());
      return foundWord ? foundWord.audio : "";
    },
    goHome() {
      this.$emit("go-home");
    },
    finishDrawing() {
      this.playSound("finish");
      this.showConfirmation = true;
    },
    confirmFinished() {
      const canvas = this.$refs.drawingCanvas;
      this.capturedDrawing = canvas.toDataURL("image/png");
      this.showConfirmation = false;
      this.isLoadingResults = true;
      this.showResultsScreen = true;

      analyzeDrawing(this.capturedDrawing, this.currentWord)
        .then((result) => {
          this.aiResults = result;
        })
        .catch((error) => {
          console.error("AI analysis failed:", error);
          this.aiResults = {
            guess: "unknown",
            isCorrect: false,
            confidence: "error",
          };
        })
        .finally(() => {
          this.isLoadingResults = false;
        });
    },
    cancelFinished() {
      this.showConfirmation = false;
    },
    handleRetry() {
      this.showResultsScreen = false;
      this.clearCanvas();
    },
    handleNextWord() {
      this.showResultsScreen = false;
      this.initGame();
    },
    handleChangeLevel() {
      this.showResultsScreen = false;
      this.$emit("change-level");
    },
  },
};
</script>
<style scoped>
.game-screen {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f0f4f8;
  position: relative;
  overflow: hidden;
}

.top-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 10;
}

.left-buttons,
.right-buttons {
  display: flex;
  gap: 8px;
  z-index: 1;
}

.hint-button {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 16px;
  background-color: #ffd166;
  color: #073b4c;
  border: none;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, background-color 0.2s ease, color 0.2s ease;
  white-space: nowrap;
  z-index: 10;
}

.hint-button:hover {
  background-color: #ef476f;
  color: white;
  transform: translateX(-50%) scale(1.05);
}

.hint-button.pressed {
  transform: translateX(-50%) scale(0.95) !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.tool-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background-color: #3d5a80;
  color: white;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.tool-button:hover {
  transform: scale(1.1);
}

.tool-button.active {
  transform: scale(1.1);
  box-shadow: 0 0 0 2px white;
}

.home {
  background-color: #ee6c4d;
}
.menu {
  background-color: #ffd166;
  color: #073b4c;
  transition: transform 0.3s ease;
}
.sound {
  background-color: #3d5a80;
}
.settings {
  background-color: #98c1d9;
}

.confirmation-popup,
.review-popup,
.settings-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.popup-content {
  background-color: white;
  padding: 25px;
  border-radius: 15px;
  text-align: center;
  max-width: 80%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes popIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.popup-content h3 {
  margin-bottom: 10px;
  color: #2c3e50;
}

.popup-content p {
  margin-bottom: 20px;
  color: #666;
}

.drawing-preview {
  margin: 20px 0;
  max-height: 60vh;
  overflow: auto;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.drawing-image {
  max-width: 100%;
  border: 3px solid white;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.volume-control {
  margin: 20px 0;
  display: flex;
  align-items: center;
  gap: 15px;
}

.volume-control label {
  font-weight: bold;
}

#volume-slider {
  flex-grow: 1;
  height: 8px;
  border-radius: 4px;
  background: #ddd;
  outline: none;
  transition: all 0.3s;
}

#volume-slider:hover {
  transform: scaleY(1.5);
}

#volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #06d6a0;
  cursor: pointer;
  transition: all 0.2s;
}

#volume-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
}

.volume-value {
  min-width: 40px;
  text-align: right;
}

.popup-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 20px;
}

.confirm-button {
  background-color: #06d6a0;
  color: white;
  border: none;
  padding: 10px 25px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.confirm-button:hover {
  background-color: #04b389;
  transform: scale(1.05);
  box-shadow: 0 3px 10px rgba(4, 179, 137, 0.4);
}

.cancel-button {
  background-color: #ef476f;
  color: white;
  border: none;
  padding: 10px 25px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.cancel-button:hover {
  background-color: #d43d63;
  transform: scale(1.05);
  box-shadow: 0 3px 10px rgba(212, 61, 99, 0.4);
}

.color-splash {
  position: absolute;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  z-index: 50;
  opacity: 0;
  animation: splash 1s ease-out;
  transform: scale(0);
  pointer-events: none;
}

@keyframes splash {
  0% {
    transform: scale(0);
    opacity: 0.8;
  }
  100% {
    transform: scale(3);
    opacity: 0;
  }
}

.tools-palette {
  position: absolute;
  top: 70px;
  left: 10px;
  background: white;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  display: flex;
  gap: 8px;
  align-items: center;
  z-index: 100;
  flex-wrap: wrap;
  max-width: 300px;
  transition: transform 0.3s ease;
}

.color-palette {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
}

.color-button {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid #eee;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.color-button:hover {
  transform: scale(1.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.brush-controls {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 0 5px;
}

.brush-size-button {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #f0f0f0;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s;
}

.brush-size-button:hover {
  background: #ddd;
  transform: scale(1.1);
}

.brush-size-display {
  font-size: 0.9rem;
  min-width: 40px;
  text-align: center;
}

.tool-button.clear {
  background: #ffebee;
  color: #c62828;
}

.tool-button.eraser {
  background: #e0e0e0;
  transition: all 0.3s;
}

.tool-button.eraser.active {
  background: #bdbdbd;
  transform: scale(1.1);
  animation: wiggle 0.5s 3;
}

@keyframes wiggle {
  0%,
  100% {
    transform: rotate(-5deg) scale(1.1);
  }
  50% {
    transform: rotate(5deg) scale(1.1);
  }
}

.drawing-area {
  flex: 1;
  margin: 15px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  touch-action: none;
  width: calc(100% - 30px);
  cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="%23000000" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"/></svg>')
      5 20,
    auto;
}

.finish-button {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 36px;
  background-color: #06d6a0;
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s;
  z-index: 10;
}

.finish-button:hover {
  transform: translateX(-50%) scale(1.05);
  animation: rainbow 2s linear infinite;
}

@keyframes rainbow {
  0% {
    background-color: #06d6a0;
  }
  25% {
    background-color: #118ab2;
  }
  50% {
    background-color: #ef476f;
  }
  75% {
    background-color: #ffd166;
  }
  100% {
    background-color: #06d6a0;
  }
}

@media (max-width: 600px) {
  .tool-button {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }

  .finish-button {
    padding: 10px 30px;
    font-size: 1.1rem;
  }

  .tools-palette {
    top: 65px;
    left: 5px;
    padding: 8px;
    max-width: 280px;
  }

  .color-button {
    width: 25px;
    height: 25px;
  }

  .popup-content {
    padding: 20px;
  }

  .popup-buttons {
    flex-direction: column;
    gap: 10px;
  }

  .confirm-button,
  .cancel-button {
    width: 100%;
  }

  .drawing-preview {
    max-height: 50vh;
  }

  .volume-control {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  #volume-slider {
    width: 100%;
  }
}
</style>