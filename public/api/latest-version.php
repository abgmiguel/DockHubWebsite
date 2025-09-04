<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Directory where VSIX files are stored
// Adjust this path based on your server setup
$download_dir = dirname(__DIR__) . '/downloads/';
$base_url = '/downloads/';

// Check if directory exists
if (!is_dir($download_dir)) {
    echo json_encode([
        'success' => false,
        'message' => 'Download directory not found'
    ]);
    exit;
}

// Scan for .vsix files
$files = glob($download_dir . '*.vsix');

if (empty($files)) {
    echo json_encode([
        'success' => false,
        'message' => 'No VSIX files found'
    ]);
    exit;
}

// Extract version numbers and find the latest
$latest_file = null;
$latest_version = '0.0.0';

foreach ($files as $file) {
    $filename = basename($file);
    
    // Extract version number from filename (format: codersinflow-0.0.695.vsix)
    if (preg_match('/codersinflow-(\d+\.\d+\.\d+)\.vsix$/i', $filename, $matches)) {
        $version = $matches[1];
        
        // Compare versions
        if (version_compare($version, $latest_version, '>')) {
            $latest_version = $version;
            $latest_file = $filename;
        }
    }
}

if ($latest_file) {
    echo json_encode([
        'success' => true,
        'version' => $latest_version,
        'filename' => $latest_file,
        'download_url' => $base_url . $latest_file,
        'file_size' => filesize($download_dir . $latest_file),
        'last_modified' => date('Y-m-d H:i:s', filemtime($download_dir . $latest_file))
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'No valid VSIX files found'
    ]);
}
?>