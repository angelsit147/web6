<?php
header('Content-Type: application/json');

$json_data = file_get_contents('php://input');
$data = json_decode($json_data, true);

$file_path = '../masonry_data.json';

if (empty($data) || !isset($data['items'])) {
    echo json_encode(['success' => false, 'message' => 'Некоректні вхідні дані.']);
    exit;
}

$result = file_put_contents($file_path, json_encode($data, JSON_PRETTY_PRINT));

if ($result !== false) {
    echo json_encode(['success' => true, 'message' => 'Дані успішно збережено.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Помилка запису у файл.']);
}
?>
