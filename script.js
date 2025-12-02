// Функция для получения параметра из URL
function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Попытка загрузить сохраненное состояние при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    const savedStateParam = getQueryParam('saved_state');
    
    if (savedStateParam) {
        try {
            const savedData = JSON.parse(decodeURIComponent(savedStateParam));
            console.log("Загружены сохраненные данные:", savedData);
            
            // Восстанавливаем состояние котика
            if (savedData.day !== undefined) pet.day = savedData.day;
            if (savedData.hour !== undefined) pet.hour = savedData.hour;
            if (savedData.fullness !== undefined) pet.fullness = savedData.fullness;
            if (savedData.energy !== undefined) pet.energy = savedData.energy;
            if (savedData.mood !== undefined) pet.mood = savedData.mood;
            
            pet.updateUI();
            console.log("Состояние котика успешно восстановлено");
        } catch (e) {
            console.error("Ошибка при загрузке сохраненного состояния:", e);
        }
    }
});
// Инициализация состояния кота
const pet = {
  day: 0,
  hour: 0,
  fullness: 5,  // Было "голод", теперь "сытость"
  energy: 5,
  mood: 5,

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
    else if (this.energy <= 2) state = 'tired'; // упростил для меньшего числа картинок
    else if (this.energy <= 4) state = 'tired';
    else if (this.mood <= 2) state = 'sad'; // упростил для меньшего числа картинок
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
  },

  // Естественное снижение параметров со временем
  decreaseAll: function() {
    this.fullness = Math.max(0, this.fullness - 1);
    this.energy = Math.max(0, this.energy - 1);
    this.mood = Math.max(0, this.mood - 1);
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

// Инициализация

pet.updateUI();
