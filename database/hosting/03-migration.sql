-- Milestone certificates migration for shared hosting (no USE statement)

CREATE TABLE IF NOT EXISTS user_category_points (
    user_id INT UNSIGNED NOT NULL,
    category_id INT UNSIGNED NOT NULL,
    points INT UNSIGNED DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, category_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS certificate_milestones (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_id INT UNSIGNED NOT NULL,
    level INT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(150) NOT NULL,
    min_points INT UNSIGNED NOT NULL,
    level_min INT UNSIGNED NOT NULL,
    level_max INT UNSIGNED NOT NULL,
    tier ENUM('starter', 'bronze', 'silver', 'gold', 'platinum', 'diamond', 'legend') NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE KEY unique_category_milestone (category_id, min_points),
    UNIQUE KEY unique_category_slug (category_id, slug)
) ENGINE=InnoDB;

ALTER TABLE points_history
    ADD COLUMN category_id INT UNSIGNED DEFAULT NULL AFTER reference_id,
    ADD INDEX idx_points_category (category_id);

ALTER TABLE certificates
    MODIFY request_id INT UNSIGNED NULL,
    MODIFY teacher_id INT UNSIGNED NULL,
    MODIFY skill_id INT UNSIGNED NULL,
    ADD COLUMN cert_type ENUM('session', 'milestone') NOT NULL DEFAULT 'session' AFTER certificate_id,
    ADD COLUMN category_id INT UNSIGNED NULL AFTER skill_id,
    ADD COLUMN milestone_id INT UNSIGNED NULL AFTER category_id,
    ADD COLUMN user_level INT UNSIGNED NULL AFTER milestone_id,
    ADD INDEX idx_cert_milestone (milestone_id),
    ADD INDEX idx_cert_category (category_id);

INSERT INTO certificate_milestones (category_id, level, name, slug, min_points, level_min, level_max, tier, description)
SELECT c.id, m.level, m.name, CONCAT(c.slug, '-', m.slug), m.min_points, m.level_min, m.level_max, m.tier, CONCAT(m.description, ' in ', c.name)
FROM categories c
CROSS JOIN (
    SELECT 1 AS level, 'Starter' AS name, 'starter' AS slug, 10 AS min_points, 10 AS level_min, 99 AS level_max, 'starter' AS tier, 'First milestone certificate at 10 points' AS description
    UNION SELECT 2, 'Bronze', 'bronze', 100, 100, 299, 'bronze', 'Bronze level certificate at 100 points'
    UNION SELECT 3, 'Silver', 'silver', 300, 300, 699, 'silver', 'Silver level certificate at 300 points'
    UNION SELECT 4, 'Gold', 'gold', 700, 700, 1499, 'gold', 'Gold level certificate at 700 points'
    UNION SELECT 5, 'Platinum', 'platinum', 1500, 1500, 4999, 'platinum', 'Platinum level certificate at 1500 points'
    UNION SELECT 6, 'Diamond', 'diamond', 5000, 5000, 9999, 'diamond', 'Diamond level certificate at 5000 points'
    UNION SELECT 7, 'Legend', 'legend', 10000, 10000, 999999, 'legend', 'Legend level certificate at 10000 points'
) m;
