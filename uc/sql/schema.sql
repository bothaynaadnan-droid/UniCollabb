-- UniCollab full schema (minimal, matches current backend models)
--
-- How to use (MySQL Workbench / mysql CLI):
-- 1) Create the database if needed: CREATE DATABASE uni_collab; (or your DB_NAME)
-- 2) Select the database (USE uni_collab;)
-- 3) Run this file.
--
-- Notes:
-- - Uses IF NOT EXISTS so it is safe to re-run.
-- - Uses UTF8MB4 for proper unicode support.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------
-- users
-- -----------------------------
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('student','supervisor','admin') NOT NULL DEFAULT 'student',
  university VARCHAR(255) NULL,

  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verification_token VARCHAR(255) NULL,
  verification_token_expires DATETIME NULL,

  password_reset_token VARCHAR(255) NULL,
  password_reset_expires DATETIME NULL,

  is_banned BOOLEAN NOT NULL DEFAULT FALSE,
  ban_reason VARCHAR(500) NULL,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_users_email (email),
  INDEX idx_users_role (role),
  INDEX idx_users_university (university)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------
-- students
-- -----------------------------
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  student_id VARCHAR(100) NULL,
  major VARCHAR(255) NULL,
  year_level VARCHAR(50) NULL,
  gpa DECIMAL(3,2) NULL,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_students_user (user_id),
  INDEX idx_students_student_id (student_id),
  INDEX idx_students_major (major),

  CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------
-- supervisors
-- -----------------------------
CREATE TABLE IF NOT EXISTS supervisors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  employee_id VARCHAR(100) NULL,
  department VARCHAR(255) NULL,
  specialization VARCHAR(255) NULL,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_supervisors_user (user_id),
  INDEX idx_supervisors_employee_id (employee_id),
  INDEX idx_supervisors_department (department),

  CONSTRAINT fk_supervisors_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------
-- projects
-- -----------------------------
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,

  creator_id INT NOT NULL,
  supervisor_id INT NULL,

  status ENUM('planning','pending','approved','rejected','in-progress','completed','cancelled') NOT NULL DEFAULT 'planning',
  deadline DATE NULL,
  requirements JSON NULL,
  visibility ENUM('public','private','university') NOT NULL DEFAULT 'public',
  file_path VARCHAR(500) NULL,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_projects_creator (creator_id),
  INDEX idx_projects_supervisor (supervisor_id),
  INDEX idx_projects_status (status),
  INDEX idx_projects_visibility (visibility),

  CONSTRAINT fk_projects_creator FOREIGN KEY (creator_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_projects_supervisor FOREIGN KEY (supervisor_id) REFERENCES supervisors(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------
-- project_members
-- -----------------------------
CREATE TABLE IF NOT EXISTS project_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  student_id INT NOT NULL,
  role ENUM('leader','member') NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_project_members (project_id, student_id),
  INDEX idx_project_members_project (project_id),
  INDEX idx_project_members_student (student_id),

  CONSTRAINT fk_project_members_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_project_members_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------
-- project_feedback
-- -----------------------------
CREATE TABLE IF NOT EXISTS project_feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  supervisor_id INT NOT NULL,
  comments TEXT NULL,
  rating DECIMAL(3,2) NULL,
  status ENUM('draft','published') NOT NULL DEFAULT 'draft',

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_project_feedback (project_id, supervisor_id),
  INDEX idx_project_feedback_project (project_id),
  INDEX idx_project_feedback_supervisor (supervisor_id),
  INDEX idx_project_feedback_status (status),

  CONSTRAINT fk_project_feedback_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_project_feedback_supervisor FOREIGN KEY (supervisor_id) REFERENCES supervisors(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------
-- join_requests
-- -----------------------------
CREATE TABLE IF NOT EXISTS join_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  requester_student_id INT NOT NULL,
  desired_role VARCHAR(50) NULL,
  message TEXT NULL,
  status ENUM('pending','accepted','rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_join_requests_project (project_id),
  INDEX idx_join_requests_requester (requester_student_id),
  INDEX idx_join_requests_status (status),

  CONSTRAINT fk_join_requests_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_join_requests_requester_student FOREIGN KEY (requester_student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------
-- supervisor_requests
-- -----------------------------
CREATE TABLE IF NOT EXISTS supervisor_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  supervisor_id INT NOT NULL,
  message TEXT NULL,
  status ENUM('pending','accepted','rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_supervisor_requests_project (project_id),
  INDEX idx_supervisor_requests_supervisor (supervisor_id),
  INDEX idx_supervisor_requests_status (status),

  CONSTRAINT fk_supervisor_requests_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_supervisor_requests_supervisor FOREIGN KEY (supervisor_id) REFERENCES supervisors(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------
-- conversations
-- -----------------------------
CREATE TABLE IF NOT EXISTS conversations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NULL,
  type ENUM('direct','group') NOT NULL DEFAULT 'direct',
  description TEXT NULL,
  created_by INT NOT NULL,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_conversations_created_by (created_by),
  INDEX idx_conversations_updated_at (updated_at),

  CONSTRAINT fk_conversations_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------
-- conversation_members
-- -----------------------------
CREATE TABLE IF NOT EXISTS conversation_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conversation_id INT NOT NULL,
  user_id INT NOT NULL,
  role ENUM('admin','member') NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  left_at TIMESTAMP NULL DEFAULT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_conversation_members_conversation (conversation_id),
  INDEX idx_conversation_members_user (user_id),
  INDEX idx_conversation_members_left_at (left_at),

  CONSTRAINT fk_conversation_members_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  CONSTRAINT fk_conversation_members_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------
-- messages
-- -----------------------------
CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conversation_id INT NOT NULL,
  sender_id INT NOT NULL,
  message_text TEXT NOT NULL,
  message_type ENUM('text','image','file') NOT NULL DEFAULT 'text',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMP NULL DEFAULT NULL,
  sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_messages_conversation (conversation_id),
  INDEX idx_messages_sender (sender_id),
  INDEX idx_messages_sent_at (sent_at),
  INDEX idx_messages_is_read (is_read),

  CONSTRAINT fk_messages_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------
-- planner_* (per-user JSON storage for UI-only features)
-- -----------------------------
CREATE TABLE IF NOT EXISTS planner_drafts (
  user_id INT NOT NULL,
  data LONGTEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  CONSTRAINT fk_planner_drafts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS planner_tasks (
  user_id INT NOT NULL,
  data LONGTEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  CONSTRAINT fk_planner_tasks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS planner_whiteboard (
  user_id INT NOT NULL,
  data LONGTEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  CONSTRAINT fk_planner_whiteboard_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS planner_events (
  user_id INT NOT NULL,
  data LONGTEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  CONSTRAINT fk_planner_events_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
