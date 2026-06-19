<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/vendor/autoload.php';

use App\Config\App;
use App\Middleware\CorsMiddleware;
use App\Middleware\CsrfMiddleware;
use App\Middleware\RateLimitMiddleware;
use App\Routes\Router;

App::loadEnv();

CorsMiddleware::handle();
CsrfMiddleware::validate();
RateLimitMiddleware::handle($_SERVER['REQUEST_URI'] ?? '/');

$router = new Router();
$router->dispatch($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);
