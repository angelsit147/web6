document.addEventListener('DOMContentLoaded', generateFields);

function generateFields() {
    const count = parseInt(document.getElementById('itemCount').value);
    const container = document.getElementById('content_fields');
    container.innerHTML = '';

    if (isNaN(count) || count < 1 || count > 10) {
        document.getElementById('message_status').textContent = 'Кількість має бути від 1 до 10.';
        return;
    }
    document.getElementById('message_status').textContent = '';

    for (let i = 1; i <= count; i++) {
        const div = document.createElement('div');
        div.id = `item_container_${i}`; // Унікальний ID для контейнера плитки
        div.innerHTML = `
            <h3>Плитка #${i}</h3>
            <label>Тип контенту:</label>
            <select id="type_${i}" onchange="updateItemContent(${i})">
                <option value="text">Текст (Заголовок та Опис)</option>
                <option value="photo">Фото (URL)</option>
            </select>
            <div id="content_area_${i}" class="content-area">
                </div>
            <br>
        `;
        container.appendChild(div);
        updateItemContent(i); // Ініціалізуємо контент за замовчуванням (текст)
    }
}

function updateItemContent(itemId) {
    const type = document.getElementById(`type_${itemId}`).value;
    const contentArea = document.getElementById(`content_area_${itemId}`);
    contentArea.innerHTML = '';

    if (type === 'text') {
        contentArea.innerHTML = `
            <label>Заголовок:</label>
            <input type="text" id="title_${itemId}" value="Заголовок ${itemId}"><br>
            <label>Текст:</label>
            <textarea id="text_${itemId}">Текст для плитки ${itemId}...</textarea>
        `;
    } else if (type === 'photo') {
        contentArea.innerHTML = `
            <label>URL фото:</label>
            <input type="url" id="image_${itemId}" placeholder="Вставте URL фото" value="https://picsum.photos/400/300">
        `;
    }
}

function saveMasonryData() {
    const count = parseInt(document.getElementById('itemCount').value);
    const items = [];

    for (let i = 1; i <= count; i++) {
        const type = document.getElementById(`type_${i}`).value;
        const itemData = { type, id: i };

        if (type === 'text') {
            itemData.title = document.getElementById(`title_${i}`).value;
            itemData.text = document.getElementById(`text_${i}`).value;
        } else if (type === 'photo') {
            itemData.imageUrl = document.getElementById(`image_${i}`).value;
        }

        items.push(itemData);
    }

    const data = {
        timestamp: Date.now(),
        items: items
    };

    const statusElement = document.getElementById('message_status');
    statusElement.textContent = 'Збереження...';

    // ШЛЯХ: 'php/save_data.php' (коректно для index.html)
    fetch('php/save_data.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            statusElement.textContent = `Успішно збережено! (${new Date(data.timestamp).toLocaleTimeString()})`;
            console.log('Дані збережено:', result);
        } else {
            statusElement.textContent = `Помилка збереження: ${result.message}`;
        }
    })
    .catch(error => {
        statusElement.textContent = `Помилка запиту: ${error.message}`;
        console.error('Помилка:', error);
    });
}