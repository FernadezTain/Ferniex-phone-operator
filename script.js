// --- ДАННЫЕ ---
const OPERATORS_DATA = {
    "FernieMobile": [
        { name: "Premium", price: 115, balance: 5000 },
        { name: "Medium", price: 70, balance: 1500 },
        { name: "Minimal", price: 20, balance: 500 }
    ],
    "FernieX": [
        { name: "PremiumX", price: 1500, balance: 30000 },
        { name: "PlatinumX", price: 1000, balance: 15000 },
        { name: "Minimal", price: 600, balance: 10000 }
    ],
    "T-2 Mobile": [
        { name: "Premium", price: 125, balance: 5500 },
        { name: "Medium", price: 55, balance: 2000 },
        { name: "Minimal", price: 45, balance: 1000 }
    ],
    "T-Mobile": [
        { name: "Premium", price: 150, balance: 4500 },
        { name: "Medium", price: 50, balance: 1650 },
        { name: "Minimal", price: 30, balance: 650 }
    ]
};

// --- СОСТОЯНИЕ ---
let generatedNumber = null;
let selectedOperator = null;
let selectedTariff = null;
let activeTimers = []; // Массив для отслеживания активных таймеров
let activeIntervals = []; // Массив для отслеживания активных интервалов

// --- НАВИГАЦИЯ ---
function goToStep(stepId) {
    // Если возвращаемся на главный экран, полностью сбрасываем состояние
    if (stepId === 'step-welcome') {
        clearAllSlots();
        generatedNumber = null;
        selectedOperator = null;
        selectedTariff = null;
    }
    
    // Отменяем все таймеры при переходе на другой шаг (кроме операторов)
    if (stepId !== 'step-operators') {
        activeTimers.forEach(timerId => clearTimeout(timerId));
        activeTimers = [];
        
        activeIntervals.forEach(intervalId => clearInterval(intervalId));
        activeIntervals = [];
    }

    // Скрываем все шаги
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
    });
    // Показываем нужный
    document.getElementById(stepId).classList.add('active');

    // Если переходим к выбору оператора, рендерим список
    if (stepId === 'step-operators') {
        document.getElementById('display-number').textContent = formatNumber(generatedNumber);
        renderOperators();
    }
}

// Функция очистки всех слотов
function clearAllSlots() {
    // Отменяем все активные таймеры
    activeTimers.forEach(timerId => clearTimeout(timerId));
    activeTimers = [];
    
    // Отменяем все активные интервалы
    activeIntervals.forEach(intervalId => clearInterval(intervalId));
    activeIntervals = [];
    
    for (let i = 1; i <= 7; i++) {
        const slot = document.getElementById(`d${i}`);
        slot.textContent = '-';
        slot.classList.remove('fixed');
    }
    // Блокируем кнопку продолжить
    const btnCont = document.getElementById('btn-continue');
    if (btnCont) {
        btnCont.disabled = true;
    }
    // Разблокируем кнопку генерации
    const btnGen = document.getElementById('btn-gen');
    if (btnGen) {
        btnGen.disabled = false;
    }
}

// Кнопка "Назад" на генераторе
function resetAndBack() {
    clearAllSlots();
    goToStep('step-welcome');
}

// --- ЛОГИКА ГЕНЕРАЦИИ (СЛОТ-МАШИНА) ---
function generateNumber() {
    const btnGen = document.getElementById('btn-gen');
    const btnCont = document.getElementById('btn-continue');
    
    // Сбрасываем старое состояние
    clearAllSlots();
    
    // Блокируем кнопку генерации пока крутится
    btnGen.disabled = true;
    btnCont.disabled = true;

    // Генерируем финальный номер (массив из 7 цифр)
    const finalDigits = Array.from({length: 7}, () => Math.floor(Math.random() * 10));
    generatedNumber = finalDigits.join('');

    // Запускаем анимацию для каждого слота
    for (let i = 1; i <= 7; i++) {
        const slot = document.getElementById(`d${i}`);
        
        // Быстрая смена цифр (эффект кручения)
        const interval = setInterval(() => {
            slot.textContent = Math.floor(Math.random() * 10);
        }, 50);
        
        // Отслеживаем интервал
        activeIntervals.push(interval);

        // Остановка по очереди слева направо
        // Задержка: 500мс старт + 300мс на каждую следующую цифру
        const timerId = setTimeout(() => {
            clearInterval(interval);
            slot.textContent = finalDigits[i-1];
            // Добавляем класс для зеленой подсветки
            slot.classList.add('fixed');
            
            // Если это последняя цифра
            if (i === 7) {
                btnGen.disabled = false;
                btnCont.disabled = false;
            }
        }, 500 + (i * 300));
        
        // Отслеживаем таймер
        activeTimers.push(timerId);
    }
}

function formatNumber(numStr) {
    // Форматирование XXX-XX-XX
    if (!numStr) return "...";
    return `${numStr.slice(0, 3)}-${numStr.slice(3, 5)}-${numStr.slice(5, 7)}`;
}

// --- ВЫБОР ОПЕРАТОРА ---
function renderOperators() {
    const listContainer = document.getElementById('operators-list');
    listContainer.innerHTML = ''; // Очистка

    for (const [opName, tariffs] of Object.entries(OPERATORS_DATA)) {
        const opCard = document.createElement('div');
        opCard.className = 'operator-card';

        let tariffHtml = '';
        tariffs.forEach(t => {
            // Экранируем данные для передачи в функцию
            const safeOpName = opName.replace(/['"]/g, "&quot;");
            const safeTariffName = t.name.replace(/['"]/g, "&quot;");

            tariffHtml += `
            <div class="tariff-item">
                <div class="tariff-info">
                    <b>${t.name}</b>
                    <div class="tariff-details">${t.price} ₽ | Бал: ${t.balance}</div>
                </div>
                <button class="btn-select-tariff" 
                    onclick="selectTariff('${safeOpName}', '${safeTariffName}')">
                    Выбрать
                </button>
            </div>
            `;
        });

        opCard.innerHTML = `
            <div class="operator-title">${opName}</div>
            <div class="tariffs-list">
                ${tariffHtml}
            </div>
        `;
        listContainer.appendChild(opCard);
    }
}

function selectTariff(operator, tariffName) {
    selectedOperator = operator;
    selectedTariff = tariffName;
    
    // Обновляем финальный экран
    document.getElementById('final-number').textContent = formatNumber(generatedNumber);
    document.getElementById('final-operator').textContent = selectedOperator;
    document.getElementById('final-tariff').textContent = selectedTariff;

    goToStep('step-final');
}

// --- ФИНАЛ: ТЕЛЕГРАМ ---
document.getElementById('btn-telegram').addEventListener('click', () => {
    if (!generatedNumber || !selectedOperator) return;

    // Формируем payload для start параметра.
    // Telegram start параметр должен быть одной строкой (base64 или просто соединенный символами)
    // Формат из ТЗ: start = PhoneNumber=(тут номер), operator= (тут оператор)
    // Чтобы ссылка работала корректно, лучше заменить пробелы и спецсимволы
    
    // Вариант 1 (простой, readable):
    const payload = `PhoneNumber-${generatedNumber}__Operator-${selectedOperator}__Tariff-${selectedTariff}`;
    
    // Вариант кодированный (более надежный для ссылок):
    // const payloadEncoded = btoa(payload); // Если бот умеет декодировать base64

    const botLink = `https://t.me/FernieXBot?start=${encodeURIComponent(payload)}`;
    
    window.open(botLink, '_blank');
});
