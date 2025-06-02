<template>
  <div class="home-screen">
    <div
      class="pencil-circle"
      :style="{ transform: `translateY(${bounceOffset}px)` }"
    >
      <svg class="pencil-icon" viewBox="0 0 24 24">
        <path
          d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"
        />
      </svg>
    </div>

    <h1 class="title">Drooly!</h1>
    <button class="draw-button" @click="startGame">Vamos Jogar</button>

    <!-- Settings Popup -->
    <div class="settings-popup" v-if="showSettings">
      <div class="popup-content">
        <h3>Configurações</h3>
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
          <button class="confirm-button" @click="closeSettings">Pronto</button>
        </div>
      </div>
    </div>

    <!-- Settings and Sound Buttons -->
    <div class="bottom-buttons">
      <button class="tool-button sound" @click="toggleSound">
        {{ soundOn ? "🔊" : "🔇" }}
      </button>
      <button
        class="tool-button settings"
        @click="openSettings"
        :class="{ active: showSettings }"
      >
        ⚙️
      </button>
    </div>
  </div>
</template>

<script>
const backgroundMusic = new Audio(require("@/assets/Music.mp3"));
backgroundMusic.loop = true;

export default {
  name: "HomeScreen",
  data() {
    return {
      bounceOffset: 0,
      bounceDirection: 1,
      showSettings: false,
      soundOn: true,
      volume: 0.7,
      audioContext: null,
    };
  },
  mounted() {
    this.startBounceAnimation();
    this.loadSettings();
    this.initializeAudio();
  },
  methods: {
    startGame() {
      this.$emit("start-game");
    },
    startBounceAnimation() {
      const animate = () => {
        if (this.bounceOffset > 10) this.bounceDirection = -1;
        if (this.bounceOffset < -10) this.bounceDirection = 1;

        this.bounceOffset += this.bounceDirection * 0.15;
        requestAnimationFrame(animate);
      };
      animate();
    },
    loadSettings() {
      const savedVolume = localStorage.getItem("volume");
      if (savedVolume) {
        this.volume = parseFloat(savedVolume);
      }

      const savedSoundState = localStorage.getItem("soundOn");
      if (savedSoundState !== null) {
        this.soundOn = savedSoundState === "true";
      }
    },
    async initializeAudio() {
      try {
        backgroundMusic.volume = this.soundOn ? this.volume : 0;
        if (!this.audioContext) {
          this.audioContext = new (window.AudioContext ||
            window.webkitAudioContext)();
        }
        await backgroundMusic.play();

        if (this.audioContext.state === "suspended") {
          await this.audioContext.resume();
          await backgroundMusic.play();
        }
      } catch (error) {
        console.log("Autoplay blocked:", error);
      }
    },
    toggleSound() {
      this.soundOn = !this.soundOn;
      localStorage.setItem("soundOn", this.soundOn);
      backgroundMusic.volume = this.soundOn ? this.volume : 0;

      if (this.soundOn && backgroundMusic.paused) {
        this.playAudio();
      }
    },
    async playAudio() {
      try {
        if (backgroundMusic.paused) {
          await backgroundMusic.play();
        }
      } catch (error) {
        console.log("Audio play failed:", error);
      }
    },
    openSettings() {
      this.showSettings = true;
    },
    closeSettings() {
      this.showSettings = false;
    },
    updateVolume() {
      localStorage.setItem("volume", this.volume);
      backgroundMusic.volume = this.soundOn ? this.volume : 0;
    },
    beforeDestroy() {
      backgroundMusic.pause();
    },
  },
};
</script>
<style scoped>
.home-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #ffdee9;
  background-image: linear-gradient(0deg, #ffdee9 0%, #b5fffc 100%);
  font-family: "Comic Sans MS", cursive, sans-serif;
  text-align: center;
  overflow: hidden;
  position: relative;
}

.pencil-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #ef476f;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
  box-shadow: 0 4px 15px rgba(239, 71, 111, 0.4);
}

.pencil-icon {
  width: 50px;
  height: 50px;
  fill: white;
}

.title {
  font-size: 4rem;
  color: #118ab2;
  margin: 0 0 30px 0;
  text-shadow: 2px 2px 0 rgba(255, 255, 255, 0.8);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.draw-button {
  padding: 15px 40px;
  font-size: 1.8rem;
  background-color: #06d6a0;
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(6, 214, 160, 0.3);
  transition: all 0.3s ease;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.draw-button:hover {
  transform: scale(1.05);
  background-color: #ef476f;
  box-shadow: 0 6px 20px rgba(239, 71, 111, 0.4);
}

.bottom-buttons {
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  gap: 10px;
}

.tool-button {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  background-color: #3d5a80;
  color: white;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.tool-button:hover {
  transform: scale(1.1);
}

.tool-button.active {
  transform: scale(1.1);
  box-shadow: 0 0 0 3px white;
}

.sound {
  background-color: #3d5a80;
}

.settings {
  background-color: #98c1d9;
}

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
}

.popup-content {
  background-color: white;
  padding: 25px;
  border-radius: 15px;
  text-align: center;
  width: 80%;
  max-width: 400px;
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
}

#volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #06d6a0;
  cursor: pointer;
}

.volume-value {
  min-width: 40px;
  text-align: right;
}

.popup-buttons {
  display: flex;
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
}

@media (max-width: 600px) {
  .title {
    font-size: 3rem;
  }

  .draw-button {
    padding: 12px 30px;
    font-size: 1.5rem;
  }

  .tool-button {
    width: 45px;
    height: 45px;
    font-size: 18px;
  }

  .popup-content {
    padding: 20px;
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
