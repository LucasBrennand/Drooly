<template>
  <div class="level-screen">
    <!-- Back Button -->
    <button class="back-button" @click="goBack">
      <svg class="back-icon" viewBox="0 0 24 24">
        <path
          d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"
        />
      </svg>
    </button>

    <h1 class="title">Escolha seu Nível!</h1>

    <!-- Level Buttons -->
    <div class="level-buttons">
      <button
        v-for="level in levels"
        :key="level.name"
        class="level-button"
        :class="level.name"
        @click="selectLevel(level.name)"
        @mouseenter="hoverLevel = level.name"
        @mouseleave="hoverLevel = null"
      >
        <span class="level-name">{{ level.displayName }}</span>
        <span class="level-description">{{ level.description }}</span>
        <span
          class="level-icon"
          :style="{
            transform: hoverLevel === level.name ? 'scale(1.1)' : 'scale(1)',
          }"
        >
          {{ level.icon }}
        </span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "LevelScreen",
  data() {
    return {
      hoverLevel: null,
      levels: [
        {
          name: "easy",
          displayName: "Fácil",
          description: "Tem uma palavra com som e uma imagem",
          icon: "😊",
        },
        {
          name: "medium",
          displayName: "Médio",
          description: "Você recebe uma palavra com som",
          icon: "🤔",
        },
        {
          name: "hard",
          displayName: "Dificíl",
          description: "Somente audio!",
          icon: "🧠",
        },
      ],
    };
  },
  methods: {
    goBack() {
      this.$emit("go-back");
    },
    selectLevel(level) {
      this.$emit("level-selected", level);
    },
  },
};
</script>

<style scoped>
.level-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #e0f7fa 0%, #b5fffc 100%);
  position: relative;
  padding: 20px;
}

.back-button {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #ef476f;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.back-button:hover {
  transform: scale(1.1);
}

.back-icon {
  width: 24px;
  height: 24px;
  fill: white;
}

.title {
  font-size: 2.5rem;
  color: #00796b;
  margin-bottom: 40px;
  text-align: center;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.level-buttons {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 400px;
}

.level-button {
  padding: 20px;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.level-button::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0));
  opacity: 0;
  transition: opacity 0.3s;
}

.level-button:hover::after {
  opacity: 1;
}

.level-button:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.level-name {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.level-description {
  font-size: 1rem;
  margin-bottom: 15px;
  opacity: 0.8;
}

.level-icon {
  font-size: 2.5rem;
  transition: transform 0.3s;
}

.easy {
  background-color: #4caf50;
  color: white;
}

.medium {
  background-color: #ffc107;
  color: #333;
}

.hard {
  background-color: #f44336;
  color: white;
}

@media (max-width: 600px) {
  .title {
    font-size: 2rem;
    margin-bottom: 30px;
  }

  .level-buttons {
    gap: 15px;
  }

  .level-button {
    padding: 15px;
  }

  .level-name {
    font-size: 1.5rem;
  }

  .level-description {
    font-size: 0.9rem;
  }

  .level-icon {
    font-size: 2rem;
  }
}
</style>
