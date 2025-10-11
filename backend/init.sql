CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some sample data
INSERT INTO tasks (title, description) VALUES 
('Learn Docker', 'Understand containerization basics'),
('Build React App', 'Create a simple frontend application'),
('Setup PostgreSQL', 'Configure database for the project');

---