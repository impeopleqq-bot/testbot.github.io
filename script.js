// Инициализация состояния кота
const pet = {
  day: 0,
  hour: 0,
  fullness: 5,
  energy: 5,
  mood: 5,

  // Загрузить сохранённые данные
  load: function() {
    const saved = localStorage.getItem('tamagotchi_pet');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.day = data.day || 0;
        this.hour = data.hour || 0;
        this.fullness = data.fullness || 5;
        this.energy = data.energy || 5;
        this.mood = data.mood || 5;
      } catch (e) {
        console.error('Ошибка загрузки:', e);
      }
    }
  },

  // Сохранить текущее состояние
  save: function() {
    const data = {
      day: this.day,
      hour: this.hour,
      fullness: this.fullness,
      energy: this.energy,
      mood: this.mood
    };
    localStorage.setItem('tamagotchi_pet', JSON.stringify(data));
  },

  // Обновление всех отображений
  updateUI: function() {
    this.updateStats();
    this.updateTime();
    this.updateImage();
  },

  // Обновление показателей
  updateStats: function() {
    document.getElementById('fullness').textContent = `Сытость: ${this.fullness}/10`;
    document.getElementById('energy').textContent = `Энергия: ${this.energy}/10`;
    document.getElementById('mood').textContent = `Настроение: ${this.mood}/10`;
  },

  // Обновление времени
  updateTime: function() {
    document.getElementById('time').textContent = `День ${this.day} - Час ${this.hour}`;
  },

  // Обновление изображения
  updateImage: function() {
    let state = 'happy';
    if (this.fullness <= 2) state = 'hungry';
    else if (this.fullness <= 4) state = 'hungry';
    else if (this.energy <= 2) state = 'tired';
    else if (this.energy <= 4) state = 'tired';
    else if (this.mood <= 2) state = 'sad';
    else if (this.mood <= 4) state = 'sad';
    document.getElementById('cat-img').src = `${state}.png`;
  },

  // Продвижение времени
  advanceTime: function(hours) {
    this.hour += hours;
    if (this.hour >= 24) {
      this.day += Math.floor(this.hour / 24);
      this.hour = this.hour % 24;
    }
    this.save(); // Автосохранение
  },

  // Естественное снижение параметров со временем
  decreaseAll: function() {
    this.fullness = Math.max(0, this.fullness - 1);
    this.energy = Math.max(0, this.energy - 1);
    this.mood = Math.max(0, this.mood - 1);
    this.save(); // Автосохранение
  }
};

// Обработчики кнопок
document.getElementById('feed-btn').addEventListener('click', () => {
  pet.fullness = Math.min(10, pet.fullness + 2);
  pet.advanceTime(1);
  pet.updateUI();
});

document.getElementById('play-btn').addEventListener('click', () => {
  pet.mood = Math.min(10, pet.mood + 3);
  pet.energy = Math.max(0, pet.energy - 2);
  pet.fullness = Math.max(0, pet.fullness - 1);
  pet.advanceTime(1);
  pet.updateUI();
});

document.getElementById('sleep-btn').addEventListener('click', () => {
  pet.energy = Math.min(10, pet.energy + 4);
  pet.fullness = Math.max(0, pet.fullness - 1);
  pet.advanceTime(5);
  pet.updateUI();
});

document.getElementById('do-nothing-btn').addEventListener('click', () => {
  pet.decreaseAll();
  pet.advanceTime(1);
  pet.updateUI();
});

// Отправка данных в Telegram
document.getElementById('save-btn').addEventListener('click', () => {
  if (Telegram.WebApp) {
    const data = JSON.stringify({
      day: pet.day,
      hour: pet.hour,
      fullness: pet.fullness,
      energy: pet.energy,
      mood: pet.mood
    });
    Telegram.WebApp.sendData(data);
    alert('💾 Сохранено!\nДанные переданы боту');
  } else {
    alert('⚠️ Работает только внутри Telegram!\nОткройте Mini App в мобильном приложении');
  }
});

// Добавляем кнопку сброса прогресса
const resetBtn = document.createElement('button');
resetBtn.id = 'reset-btn';
resetBtn.textContent = '🔄 Сбросить прогресс';
document.querySelector('.buttons').appendChild(resetBtn);

resetBtn.addEventListener('click', () => {
  if (confirm('Вы уверены? Весь прогресс будет удалён!')) {
    localStorage.removeItem('tamagotchi_pet');
    pet.day = 0;
    pet.hour = 0;
    pet.fullness = 5;
    pet.energy = 5;
    pet.mood = 5;
    pet.updateUI();
    alert('Прогресс сброшен!');
  }
});

// Инициализация при загрузке
pet.load(); // Загружаем сохранённое состояние
pet.updateUI();
