-- SkillSwap AI - Seed data for shared hosting (no USE statement)

INSERT INTO users (uuid, name, email, password, role, points, is_verified) VALUES
(UUID(), 'Admin User', 'admin@skillswap.ai', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 1000, 1);

INSERT INTO categories (name, slug, description, icon, color) VALUES
('Programming', 'programming', 'Software development and coding skills', 'code', '#6366F1'),
('Design', 'design', 'UI/UX, graphic design, and creative skills', 'palette', '#8B5CF6'),
('Languages', 'languages', 'Learn new languages from native speakers', 'languages', '#06B6D4'),
('Music', 'music', 'Instruments, vocals, and music theory', 'music', '#F59E0B'),
('Business', 'business', 'Entrepreneurship, marketing, and finance', 'briefcase', '#22C55E'),
('Photography', 'photography', 'Camera skills, editing, and composition', 'camera', '#EF4444'),
('Fitness', 'fitness', 'Workout routines, yoga, and wellness', 'dumbbell', '#EC4899'),
('Cooking', 'cooking', 'Culinary arts and recipe sharing', 'chef-hat', '#F97316');

INSERT INTO achievements (name, slug, description, icon, color, min_points, min_sessions, tier) VALUES
('Bronze Teacher', 'bronze-teacher', 'Complete 5 teaching sessions', 'award', '#CD7F32', 50, 5, 'bronze'),
('Silver Mentor', 'silver-mentor', 'Complete 15 teaching sessions', 'medal', '#C0C0C0', 150, 15, 'silver'),
('Gold Expert', 'gold-expert', 'Complete 30 teaching sessions', 'trophy', '#FFD700', 300, 30, 'gold'),
('Diamond Master', 'diamond-master', 'Complete 50 teaching sessions', 'gem', '#B9F2FF', 500, 50, 'diamond'),
('Elite Coach', 'elite-coach', 'Complete 100 teaching sessions', 'crown', '#6366F1', 1000, 100, 'elite');

INSERT INTO site_stats (stat_key, stat_value) VALUES
('total_users', 1),
('total_skills', 0),
('total_requests', 0),
('accepted_requests', 0),
('rejected_requests', 0);
