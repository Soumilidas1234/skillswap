<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Helpers\Response;
use App\Middleware\AuthMiddleware;
use App\Models\Certificate;
use App\Models\CertificateMilestone;

class CertificateController
{
    public function milestones(): void
    {
        Response::success(CertificateMilestone::getAll());
    }

    public function index(): void
    {
        $user = AuthMiddleware::handle(true);
        CertificateMilestone::checkAllCategories((int) $user['id']);
        Response::success(Certificate::getByUser((int) $user['id']));
    }

    public function verify(string $certId): void
    {
        $cert = Certificate::findByCertId($certId);
        if (!$cert) {
            Response::error('Certificate not found', 404);
        }
        Response::success([
            'valid' => true,
            'certificate' => $cert,
        ]);
    }

    public function show(string $certId): void
    {
        $user = AuthMiddleware::handle(true);
        $cert = Certificate::findByCertId($certId);

        if (!$cert) {
            Response::error('Certificate not found', 404);
        }

        if ((int) $cert['learner_id'] !== (int) $user['id'] && (int) $cert['teacher_id'] !== (int) $user['id']) {
            Response::error('Unauthorized', 403);
        }

        Response::success($cert);
    }
}
