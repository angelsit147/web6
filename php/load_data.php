<?php
header('Content-Type: application/json');

$file_path = '../masonry_data.json';

if (!file_exists($file_path)) {
    echo json_encode(['success' => false, 'message' => 'Файл даних не знайдено.']);
    exit;
}

$data = file_get_contents($file_path);
$json_data = json_decode($data, true);

if ($json_data === null) {
    echo json_encode(['success' => false, 'message' => 'Помилка читання JSON.']);
    exit;
}

$json_data['file_mtime'] = filemtime($file_path);

echo json_encode(['success' => true, 'data' => $json_data]);
?>