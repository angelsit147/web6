let lastUpdateTime = 0;
let lastLoadedData = null; // ДОДАНО: Зберігаємо останні завантажені дані
let resizeTimer; // ДОДАНО: Таймер для оптимізації (debounce)

document.addEventListener('DOMContentLoaded', () => {
    loadAndRenderMasonry();

    setInterval(checkAndUpdateMasonry, 5000);

    window.addEventListener('resize', () => {
        // Оптимізація (Debounce): чекаємо, поки користувач закінчить змінювати розмір
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (lastLoadedData) {
                // Перемальовуємо макет з останніми даними
                loadAndRenderMasonry(lastLoadedData);
            }
        }, 100); // 100мс затримка
    });
});

function checkAndUpdateMasonry() {
    // ШЛЯХ: '../php/load_data.php' (коректно для html/index_second.html)
    fetch('../php/load_data.php')
        .then(response => response.json())
        .then(result => {
            if (result.success && result.data && result.data.file_mtime) {
                const currentMTime = result.data.file_mtime;
                
                if (currentMTime > lastUpdateTime) {
                    loadAndRenderMasonry(result.data);
                    lastUpdateTime = currentMTime;
                    document.getElementById('update_status').textContent = `Оновлено: ${new Date(currentMTime * 1000).toLocaleTimeString()}`;
                } else {
                    document.getElementById('update_status').textContent = `Дані актуальні. (Остання перевірка: ${new Date().toLocaleTimeString()})`;
                }
            } else {
                document.getElementById('update_status').textContent = `Помилка завантаження даних: ${result.message || 'Невідома помилка'}`;
            }
        })
        .catch(error => {
            document.getElementById('update_status').textContent = `Помилка мережі: ${error.message}`;
            console.error('Помилка:', error);
        });
}


function loadAndRenderMasonry(data = null) {
    const render = (dataToRender) => {
        const items = dataToRender.items || [];
        const container = document.getElementById('masonry_container');
        container.innerHTML = '';
        container.style.position = 'relative';
        
        if (items.length === 0) {
            container.innerHTML = '<p style="text-align: center; margin-top: 20px;">Немає даних для відображення.</p>';
            return;
        }

        const columnCount = 3;
        const columnHeights = Array(columnCount).fill(0); // Висота кожного стовпця
        const gutter = 5;
        let imagesToLoad = 0;

        items.forEach((item, index) => {
            // 1. Знайти найкоротший стовпець
            let minHeight = Math.min(...columnHeights);
            let columnIndex = columnHeights.indexOf(minHeight);

            // 2. Створити елемент плитки
            const itemElement = document.createElement('div');
            itemElement.className = 'masonry-item';
            
            // 3. Розрахувати позицію
            // ВИПРАВЛЕНА ФОРМУЛА ДЛЯ ВІДСТУПІВ
            const itemWidth = (container.clientWidth - (columnCount - 1) * gutter) / columnCount;
            const leftPosition = columnIndex * (itemWidth + gutter);
            const topPosition = columnHeights[columnIndex]; 

            // 4. Застосувати стилі (РОЗКОМЕНТОВАНО)
            // Це виправляє проблему відсутності відступів та накладання
            let cssString = `
                position: absolute;
                width: ${itemWidth}px;
                left: ${leftPosition}px;
                top: ${topPosition}px;
                box-sizing: border-box;
                border-radius: 5px;
                box-shadow: 2px 2px 5px rgba(0,0,0,0.1);
            `;

            if (item.type === 'text') {
                cssString += `
                    background-color: #ffffff;
                    border: 1px solid #ccc;
                    padding: 10px;
                `;
            } else if (item.type === 'photo') {
                cssString += `
                    background-color: #eee; /* Фон під час завантаження */
                    overflow: hidden; /* Обрізає фото по заокруглених кутах */
                `;
            }
            itemElement.style.cssText = cssString;
            
            // 5. Формування HTML відповідно до ТИПУ
            let innerContentHtml = '';
            if (item.type === 'text') {
                 innerContentHtml = `
                    <div class="masonry-content">
                        <h4>${item.title}</h4>
                        <p>${item.text}</p>
                    </div>
                 `;
            } else if (item.type === 'photo') {
                 innerContentHtml = `
                    <img src="${item.imageUrl}" alt="Фото" class="masonry-image">
                 `;
            }
            itemElement.innerHTML = innerContentHtml;

            // 6. Додати до контейнера
            container.appendChild(itemElement);

            // 7. ОБРОБКА ЗОБРАЖЕННЯ (для коректної висоти, якщо це фото)
            if (item.type === 'photo' && item.imageUrl) {
                imagesToLoad++;
                const img = itemElement.querySelector('.masonry-image');
                
                if (img && img.complete) {
                    imagesToLoad--; // Якщо готове, не чекаємо
                } else if (img) {
                    // Чекаємо завантаження
                    img.onload = function() {
                        imagesToLoad--;
                        // Викликаємо фінальний рендеринг після завантаження
                        if (imagesToLoad === 0) {
                            loadAndRenderMasonry(dataToRender);
                        }
                    };
                    img.onerror = function() {
                        imagesToLoad--; // Все одно зменшуємо лічильник
                    };
                }
            }

            // 8. ОНОВЛЕННЯ ВИСОТИ
            const itemHeight = itemElement.offsetHeight;
            if (item.type === 'text' || imagesToLoad === 0) {
                 columnHeights[columnIndex] = topPosition + itemHeight + gutter;
            }
        });

        if (imagesToLoad > 0) {
             return; 
        }

        container.style.height = `${Math.max(...columnHeights)}px`;
    };

    if (data) {
        render(data);
    } else {
        // Завантаження даних, якщо їх не передано
        fetch('../php/load_data.php') // Переконайтесь, що шлях правильний!
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    lastLoadedData = result.data; // ДОДАНО: Зберігаємо дані
                    render(lastLoadedData);
                    lastUpdateTime = result.data.file_mtime || 0;
                } else {
                    document.getElementById('update_status').textContent = `Помилка завантаження: ${result.message}`;
                }
            })
            .catch(error => {
                document.getElementById('update_status').textContent = `Помилка під час початкового завантаження: ${error.message}`;
            });
    }
}