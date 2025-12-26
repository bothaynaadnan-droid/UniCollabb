-- Minimal schema for request flows used by the frontend
-- Apply this after your MySQL connection and database (DB_NAME) are working.

-- Join requests: a student asks to join a project; creator accepts/rejects.
CREATE TABLE IF NOT EXISTS join_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  requester_student_id INT NOT NULL,
  desired_role VARCHAR(50) NULL,
  message TEXT NULL,
  status ENUM('pending','accepted','rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_join_requests_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_join_requests_requester_student FOREIGN KEY (requester_student_id) REFERENCES students(id) ON DELETE CASCADE,
  INDEX idx_join_requests_project (project_id),
  INDEX idx_join_requests_requester (requester_student_id),
  INDEX idx_join_requests_status (status)
);

-- Supervision requests: project creator asks a supervisor to supervise a project.
CREATE TABLE IF NOT EXISTS supervisor_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  supervisor_id INT NOT NULL,
  message TEXT NULL,
  status ENUM('pending','accepted','rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_supervisor_requests_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_supervisor_requests_supervisor FOREIGN KEY (supervisor_id) REFERENCES supervisors(id) ON DELETE CASCADE,
  INDEX idx_supervisor_requests_project (project_id),
  INDEX idx_supervisor_requests_supervisor (supervisor_id),
  INDEX idx_supervisor_requests_status (status)
);
