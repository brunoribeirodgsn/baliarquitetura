<?php
/* ================================================================
   BALI ARQUITETURA — API PHP (Hostinger + MySQL)
   Substitui api/bali-data.js (Vercel/Node.js)
   ================================================================ */

/* ── Configuração do banco ────────────────────────────────────── */
define('DB_HOST', 'localhost');
define('DB_NAME', 'u369552574_baliarq');
define('DB_USER', 'u369552574_diegobali');
define('DB_PASS', 'Sitearquitodiegodelgado123!');
define('ADMIN_PASSWORD', 'bali2026');

/* ── Headers ─────────────────────────────────────────────────── */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, x-bali-admin-password');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

/* ── Conexão MySQL ───────────────────────────────────────────── */
function getDb() {
    static $pdo = null;
    if ($pdo) return $pdo;

    try {
        $pdo = new PDO(
            'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]
        );
        ensureSchema($pdo);
    } catch (PDOException $e) {
        sendJson(500, ['error' => 'Erro de conexão: ' . $e->getMessage()]);
        exit;
    }

    return $pdo;
}

function ensureSchema($pdo) {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS bali_content (
            `key`        VARCHAR(64)  NOT NULL PRIMARY KEY,
            `content`    LONGTEXT     NOT NULL,
            `updated_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
}

/* ── Helpers ─────────────────────────────────────────────────── */
function sendJson($status, $payload) {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function requireAdmin() {
    $supplied = isset($_SERVER['HTTP_X_BALI_ADMIN_PASSWORD'])
        ? $_SERVER['HTTP_X_BALI_ADMIN_PASSWORD']
        : '';
    if ($supplied !== ADMIN_PASSWORD) {
        sendJson(401, ['error' => 'Senha do admin inválida.']);
    }
}

function readBody() {
    $raw = file_get_contents('php://input');
    if (!$raw) return [];
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

/* ── Chaves válidas ──────────────────────────────────────────── */
$VALID_KEYS = ['hero', 'portfolio', 'projetos'];

/* ── Roteamento ──────────────────────────────────────────────── */
$method = $_SERVER['REQUEST_METHOD'];
$db     = getDb();

/* GET — retorna todos os dados */
if ($method === 'GET') {
    $stmt = $db->query("SELECT `key`, `content` FROM bali_content");
    $rows = $stmt->fetchAll();

    $payload = ['hero' => null, 'portfolio' => null, 'projetos' => null];
    foreach ($rows as $row) {
        if (in_array($row['key'], $VALID_KEYS)) {
            $decoded = json_decode($row['content'], true);
            $payload[$row['key']] = $decoded !== null ? $decoded : $row['content'];
        }
    }
    sendJson(200, $payload);
}

/* POST — salva/atualiza dado */
if ($method === 'POST') {
    requireAdmin();

    $body = readBody();
    $key  = isset($body['key']) ? $body['key'] : '';

    if (!in_array($key, $VALID_KEYS)) {
        sendJson(400, ['error' => 'Chave inválida.']);
    }

    $value   = isset($body['value']) ? $body['value'] : null;
    $content = json_encode($value, JSON_UNESCAPED_UNICODE);

    $stmt = $db->prepare("
        INSERT INTO bali_content (`key`, `content`, `updated_at`)
        VALUES (:key, :content, NOW())
        ON DUPLICATE KEY UPDATE `content` = VALUES(`content`), `updated_at` = NOW()
    ");
    $stmt->execute([':key' => $key, ':content' => $content]);

    sendJson(200, ['ok' => true]);
}

/* DELETE — remove dado por chave */
if ($method === 'DELETE') {
    requireAdmin();

    $key = isset($_GET['key']) ? $_GET['key'] : '';

    if (!in_array($key, $VALID_KEYS)) {
        sendJson(400, ['error' => 'Chave inválida.']);
    }

    $stmt = $db->prepare("DELETE FROM bali_content WHERE `key` = :key");
    $stmt->execute([':key' => $key]);

    sendJson(200, ['ok' => true]);
}

/* Método não permitido */
header('Allow: GET, POST, DELETE');
sendJson(405, ['error' => 'Método não permitido.']);
