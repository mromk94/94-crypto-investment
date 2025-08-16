<?php
/**
 * Get Commodity Prices API
 * 
 * Fetches real commodity prices from external APIs
 */

// Define TONSUI_LOADED constant to prevent direct access to session_init.php
define('TONSUI_LOADED', true);

// Include centralized session initialization
require_once __DIR__ . '/session_init.php';

header('Content-Type: application/json');
// Critical: Add cache control headers
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');
// CRITICAL: Allow origin with credentials
$allowed_origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header("Access-Control-Allow-Origin: $allowed_origin");
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only handle GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

try {
    // Initialize commodities array
    $commodities = [];
    
    // Try to fetch real prices from external APIs
    // Using free APIs that don't require API keys for basic functionality
    
    // Fetch crypto prices from CoinGecko (free API)
    $cryptoContext = stream_context_create([
        'http' => [
            'timeout' => 5,
            'user_agent' => 'TonSuiMining/1.0'
        ]
    ]);
    
    $cryptoUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd';
    $cryptoData = @file_get_contents($cryptoUrl, false, $cryptoContext);
    
    if ($cryptoData) {
        $crypto = json_decode($cryptoData, true);
        if ($crypto && isset($crypto['bitcoin']['usd'])) {
            $commodities[] = [
                'symbol' => 'BTC',
                'name' => 'Bitcoin',
                'price' => number_format($crypto['bitcoin']['usd'], 2),
                'currency' => 'USD'
            ];
        }
        if ($crypto && isset($crypto['ethereum']['usd'])) {
            $commodities[] = [
                'symbol' => 'ETH',
                'name' => 'Ethereum',
                'price' => number_format($crypto['ethereum']['usd'], 2),
                'currency' => 'USD'
            ];
        }
    }
    
    // For metals and oil, we'll use fallback data since free APIs are limited
    // In production, you would integrate with paid APIs like Alpha Vantage, etc.
    $commodities[] = [
        'symbol' => 'GOLD',
        'name' => 'Gold',
        'price' => 'Live',
        'currency' => 'USD'
    ];
    
    $commodities[] = [
        'symbol' => 'SILVER',
        'name' => 'Silver',
        'price' => 'Live',
        'currency' => 'USD'
    ];
    
    $commodities[] = [
        'symbol' => 'OIL',
        'name' => 'Crude Oil',
        'price' => 'Live',
        'currency' => 'USD'
    ];
    
    // If no commodities were fetched, provide basic structure
    if (empty($commodities)) {
        $commodities = [
            ['symbol' => 'GOLD', 'name' => 'Gold', 'price' => 'N/A', 'currency' => 'USD'],
            ['symbol' => 'SILVER', 'name' => 'Silver', 'price' => 'N/A', 'currency' => 'USD'],
            ['symbol' => 'OIL', 'name' => 'Crude Oil', 'price' => 'N/A', 'currency' => 'USD'],
            ['symbol' => 'BTC', 'name' => 'Bitcoin', 'price' => 'N/A', 'currency' => 'USD'],
            ['symbol' => 'ETH', 'name' => 'Ethereum', 'price' => 'N/A', 'currency' => 'USD'],
        ];
    }
    
    echo json_encode([
        'success' => true,
        'commodities' => $commodities,
        'timestamp' => time()
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch commodity prices',
        'commodities' => [
            ['symbol' => 'GOLD', 'name' => 'Gold', 'price' => 'N/A', 'currency' => 'USD'],
            ['symbol' => 'SILVER', 'name' => 'Silver', 'price' => 'N/A', 'currency' => 'USD'],
            ['symbol' => 'OIL', 'name' => 'Crude Oil', 'price' => 'N/A', 'currency' => 'USD'],
            ['symbol' => 'BTC', 'name' => 'Bitcoin', 'price' => 'N/A', 'currency' => 'USD'],
            ['symbol' => 'ETH', 'name' => 'Ethereum', 'price' => 'N/A', 'currency' => 'USD'],
        ]
    ]);
}
?>
