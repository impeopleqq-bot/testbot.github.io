// Функция для логирования с префиксом времени
function logWithTime(message, data = null) {
  const now = new Date().toISOString();
  console.log(`[${now}] ${message}`);
  if (data) {
    console.log(data);
  }
  
  // Дополнительно выводим в интерфейс для отладки в Telegram
  const logElement = document.getElementById('debug-log');
  if (logElement) {
    const logEntry = document.createElement('div');
    logEntry.textContent = `[${now.split('T')[1].slice(0, 8)}] ${message}`;
    logElement.prepend(logEntry);
    // Ограничиваем количество записей в логе
    if (logElement.children.length > 10) {
      logElement.removeChild(logElement.lastChild);
    }
  }
}

// Инициализация состояния кота
const pet = {
  day: 0,
  hour: 0,
  fullness: 5,
  energy: 5,
  mood: 5,

  // Обновление всех отображений
  updateUI: function() {
    this.updateStats();
    this.updateTime();
    this.updateImage();
    logWithTime('UI обновлено', {...this});
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
    else if (this.fullness <= 4) state = 'hungry-mid';
    else if (this.energy <= 2) state = 'tired';
    else if (this.energy <= 4) state = 'tired-mid';
    else if (this.mood <= 2) state = 'sad';
    else if (this.mood <= 4) state = 'sad-mid';
    document.getElementById('cat-img').src = `${state}.png`;
  },

  // Продвижение времени
  advanceTime: function(hours) {
    this.hour += hours;
    if (this.hour >= 24) {
      this.day += Math.floor(this.hour / 24);
      this.hour = this.hour % 24;
    }
    logWithTime(`Время изменено: +${hours} часов`);
  },

  // Естественное снижение параметров со временем
  decreaseAll: function() {
    this.fullness = Math.max(0, this.fullness - 1);
    this.energy = Math.max(0, this.energy - 1);
    this.mood = Math.max(0, this.mood - 1);
    logWithTime('Параметры естественно снижены');
  },
  
  // Загрузка состояния из данных
  loadState: function(state) {
    if (!state) return;
    
    this.day = state.day || 0;
    this.hour = state.hour || 0;
    this.fullness = state.fullness || 5;
    this.energy = state.energy || 5;
    this.mood = state.mood || 5;
    
    logWithTime('Состояние загружено из сохраненных данных', state);
  }
};

// Добавляем элемент для отображения логов в интерфейсе
const debugSection = document.createElement('div');
debugSection.style.marginTop = '15px';
debugSection.style.fontSize = '0.8em';
debugSection.style.color = '#666';
debugSection.style.textAlign = 'left';
debugSection.innerHTML = '<div><strong>Логи:</strong></div><div id="debug-log" style="max-height: 100px; overflow-y: auto; border: 1px solid #eee; padding: 5px; border-radius: 4px;"></div>';
document.body.insertBefore(debugSection, document.body.firstChild);

// Загрузка сохраненного состояния при запуске
function loadSavedState() {
  logWithTime('Попытка загрузить сохраненное состояние');
  
  try {
    if (window.Telegram && window.Telegram.WebApp) {
      logWithTime('Telegram WebApp доступен');
      
      // Пытаемся получить данные от бота
      const initData = window.Telegram.WebApp.initData || '';
      logWithTime('Init data получены', initData);
      
      // Извлекаем сохраненное состояние из параметров запуска
      const params = new URLSearchParams(window.location.search);
      const savedState = params.get('state');
      
      if (savedState) {
        try {
          const state = JSON.parse(decodeURIComponent(savedState));
          pet.loadState(state);
          logWithTime('Состояние успешно загружено из URL параметров');
        } catch (e) {
          logWithTime('Ошибка при разборе состояния из URL', e.message);
        }
      } else {
        logWithTime('Состояние не найдено в URL параметрах');
      }
      
      // Регистрируем обработчик получения данных от бота
      window.Telegram.WebApp.onEvent('mainButtonClicked', function() {
        logWithTime('Главная кнопка нажата');
      });
    } else {
      logWithTime('Telegram WebApp не доступен');
    }
  } catch (error) {
    logWithTime('Ошибка при загрузке состояния', error.message);
  }
}

// Отправка данных в Telegram
document.getElementById('save-btn').addEventListener('click', () => {
  logWithTime('Нажата кнопка сохранения');
  
  if (window.Telegram && window.Telegram.WebApp) {
    const data = {
      day: pet.day,
      hour: pet.hour,
      fullness: pet.fullness,
      energy: pet.energy,
      mood: pet.mood
    };
    
    try {
      const jsonData = JSON.stringify(data);
      logWithTime('Данные для сохранения', data);
      
      window.Telegram.WebApp.sendData(jsonData);
      logWithTime('Данные отправлены в Telegram');
      
      // Показываем уведомление в интерфейсе вместо alert
      const notification = document.createElement('div');
      notification.style.position = 'fixed';
      notification.style.bottom = '20px';
      notification.style.left = '50%';
      notification.style.transform = 'translateX(-50%)';
      notification.style.backgroundColor = '#4CAF50';
      notification.style.color = 'white';
      notification.style.padding = '10px 20px';
      notification.style.borderRadius = '5px';
      notification.style.zIndex = '1000';
      notification.textContent = '💾 Сохранено! Данные переданы боту';
      
      document.body.appendChild(notification);
      
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);
      
    } catch (error) {
      logWithTime('Ошибка при отправке данных', error.message);
      alert(`Ошибка сохранения: ${error.message}`);
    }
  } else {
    logWithTime('Попытка сохранения вне Telegram');
    alert('⚠️ Работает только внутри Telegram!\nОткройте Mini App в мобильном приложении');
  }
});

// Инициализация приложения
logWithTime('Приложение запускается');
loadSavedState();
pet.updateUI();

logWithTime('Приложение инициализировано');
