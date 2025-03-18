# SmartSprint: AI-Enhanced Kanban Solution for Agile Teams

SmartSprint is an AI-powered Kanban Planner and Task Manager for IT projects in large organizations. The software streamlines project management by allowing project managers to write feature stories or documentation, which AI will analyze to generate structured tickets for developers and engineers with timelines and dependencies.

## Features

- **AI-Powered Task Generation**: Write feature stories or documentation and let AI analyze them to generate structured tickets with timelines and dependencies.
- **Kanban Board**: Drag-and-drop interface for intuitive task management and visualization of project workflow.
- **Personalized Task Boards**: Developers can track assignments, update statuses, and collaborate via comments.
- **AI-Driven Analytics**: Track performance, generate progress reports, and optimize task distribution.
- **Integration Support**: Works as a standalone application and integrates with existing platforms like Jira and Trello.

## Technology Stack

- **Frontend**: Next.js with TypeScript, Material-UI/Tailwind CSS
- **Backend**: Node.js with MySQL
- **AI/ML**: NLP models for feature analysis and task generation

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- MySQL server (5.7 or 8.x)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/mrudul-UmassD/SmartSprint_NextJS.git
   cd SmartSprint_NextJS
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up the database:

   #### Using the setup script (Recommended)
   
   **On Unix/macOS:**
   ```
   chmod +x setup-database.sh
   ./setup-database.sh
   ```
   
   **On Windows:**
   ```
   setup-database.bat
   ```
   
   This script will:
   - Check for Node.js, npm, and MySQL installations
   - Install required dependencies
   - Create a new MySQL database
   - Set up the database schema
   - Configure the application to connect to the database
   
   #### Manual setup
   
   If you prefer to set up the database manually:
   
   1. Copy `.env.example` to `.env` and update with your MySQL credentials:
      ```
      cp .env.example .env
      ```
   
   2. Edit the `.env` file with your database information:
      ```
      DB_HOST=localhost
      DB_PORT=3306
      DB_USER=your_mysql_username
      DB_PASSWORD=your_mysql_password
      DB_NAME=smartsprint
      ```
   
   3. Run the database setup script:
      ```
      npm run setup-db
      ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Default Admin Credentials

After setup, you can log in with the default admin account:
- **Username**: admin
- **Password**: admin123

Be sure to change this password in a production environment.

## Deploying to GitHub

To upload this code to your own GitHub repository:

1. **Using the provided script:**

   **On Windows:**
   ```
   git-setup.bat
   ```
   
   **On Unix/macOS:**
   ```
   chmod +x git-setup.sh
   ./git-setup.sh
   ```

2. **Manually:**
   ```
   git init
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git push -u origin main
   ```

You'll need to provide your GitHub credentials when pushing.

## Project Structure

```
smart-sprint/
├── public/             # Static files
├── scripts/            # Setup and utility scripts
├── src/
│   ├── app/            # Next.js App Router
│   ├── components/     # React components
│   ├── lib/            # Utility functions and libraries
│   ├── models/         # Data models and types
│   ├── pages/          # Next.js pages and API routes
│   └── styles/         # Global styles
├── package.json        # Project dependencies
├── tsconfig.json       # TypeScript configuration
├── tailwind.config.js  # Tailwind CSS configuration
├── setup-database.sh   # Unix/macOS database setup script
└── setup-database.bat  # Windows database setup script
```

## Database Schema

The application uses the following main tables:
- `users` - User accounts and profiles
- `projects` - Project information
- `tasks` - Individual tasks/tickets
- `tags` - Task labels/categories
- `task_tags` - Relationship between tasks and tags
- `task_dependencies` - Dependencies between tasks
- `comments` - Comments on tasks

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/) - The React Framework
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [Material-UI](https://mui.com/) - React components for faster and easier web development
- [MySQL](https://www.mysql.com/) - Open-source relational database 