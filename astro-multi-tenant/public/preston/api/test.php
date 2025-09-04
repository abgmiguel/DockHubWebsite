<?php
// Simple test file to verify PHP is working
header('Content-Type: application/json');

echo json_encode([
    'status' => 'PHP is working!',
    'php_version' => PHP_VERSION,
    'server_time' => date('Y-m-d H:i:s'),
    'downloads_dir_exists' => is_dir('../downloads/'),
    'downloads_dir_path' => realpath('../downloads/')
]);
?>