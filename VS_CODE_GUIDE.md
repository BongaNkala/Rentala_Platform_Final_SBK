# Running the Rentala Platform in VS Code

This guide provides the exact step-by-step instructions to get the Rentala Platform running on your local machine using Visual Studio Code.

---

## Prerequisites

Before you begin, ensure you have the following installed on your computer:

1.  **Visual Studio Code**: The code editor. [Download here](https://code.visualstudio.com/download)
2.  **Node.js and npm**: The JavaScript runtime and package manager. (LTS version recommended) [Download here](https://nodejs.org/)
3.  **Git**: The version control system. [Download here](https://git-scm.com/downloads)

You can verify your installations by opening a terminal and running:

```bash
code --version
node --version
npm --version
git --version
```

---

## Step 1: Get the Code

First, you need to get the project files onto your local machine.

### Clone the Repository

1.  Open a terminal (or Git Bash on Windows).
2.  Navigate to the directory where you want to store the project (e.g., `cd Documents/Projects`).
3.  Clone the repository from GitHub:

    ```bash
    git clone https://github.com/BongaNkala/Rentala-Platform.M.git
    ```

This will create a new folder named `Rentala-Platform.M` containing all the project files.

---

## Step 2: Open the Project in VS Code

Now, open the project in your code editor.

1.  Navigate into the newly created project directory:

    ```bash
    cd Rentala-Platform.M
    ```

2.  Open the entire folder in VS Code with this command:

    ```bash
    code .
    ```

Alternatively, you can open VS Code and go to **File > Open Folder...** and select the `Rentala-Platform.M` directory.

When you open the folder, VS Code might ask if you trust the authors. Click **"Yes, I trust the authors"**.

---

## Step 3: Install Dependencies

The project uses several Node.js packages (like Express and SQLite) that need to be installed.

1.  **Open the Integrated Terminal** in VS Code.
    *   You can use the shortcut: **Ctrl + `** (Control + Backtick)
    *   Or go to the menu: **Terminal > New Terminal**

2.  In the terminal panel that appears at the bottom, run the following command to install all the necessary packages listed in `package.json`:

    ```bash
    npm install
    ```

This will create a `node_modules` folder in your project, which contains all the downloaded dependencies.

---

## Step 4: Run the Server

With the dependencies installed, you can now start the backend server.

1.  In the same integrated terminal, run the start script:

    ```bash
    npm start
    ```

2.  You should see the following output, confirming the server is running:

    ```
    > rentala-platform@1.0.0 start
    > node server.js

    Server running on http://localhost:3002
    Database connected and tables ensured.
    ```

**The server is now active and listening for requests!** Keep this terminal running. If you close it, the server will stop.

---

## Step 5: Access the Application

Your Rentala Platform is now running locally.

1.  Open your web browser (Chrome, Firefox, etc.).
2.  Navigate to the login page:

    [http://localhost:3002/login.html](http://localhost:3002/login.html)

3.  Use the demo credentials to log in:
    *   **Email**: `demo@rentala.com`
    *   **Password**: `demopassword123`

4.  After logging in, you will be redirected to the elegant dashboard:

    [http://localhost:3002/dashboard.html](http://localhost:3002/dashboard.html)

---

## Using the VS Code Workspace

The project includes a `rentala.code-workspace` file. This file can store recommended settings and extensions for the project.

### Recommended Extensions

For the best development experience, consider installing these VS Code extensions. Go to the **Extensions** view (Ctrl+Shift+X) and search for:

*   **Live Server**: For launching static pages without the Node.js server.
*   **Prettier - Code formatter**: To keep your code formatting consistent.
*   **ESLint**: To find and fix problems in your JavaScript code.
*   **SQLite Viewer**: To view and manage the `rentala.db` database file directly in VS Code.

---

## Troubleshooting

*   **`npm` or `node` command not found**: This means Node.js is not installed correctly or its location is not in your system's PATH. Re-run the Node.js installer.

*   **Port 3002 already in use**: If another application is using this port, you can change it.
    1.  Open `server.js`.
    2.  Find the line: `const PORT = process.env.PORT || 3002;`
    3.  Change `3002` to another number (e.g., `3003`).
    4.  Restart the server (`npm start`) and access the app at the new port.

*   **Changes not appearing**: Make sure you have saved your files in VS Code and refreshed the browser page (use Ctrl+F5 for a hard refresh).

*   **Database errors**: If you see database errors, you can safely delete the `rentala.db` file. The server will automatically recreate it with the correct schema when you run `npm start` again.

---

## Summary of Commands

```bash
# 1. Clone the repository
git clone https://github.com/BongaNkala/Rentala-Platform.M.git

# 2. Navigate into the directory
cd Rentala-Platform.M

# 3. Open in VS Code
code .

# 4. Install dependencies (in VS Code terminal)
npm install

# 5. Run the server (in VS Code terminal)
npm start
```

**You are now fully set up to run, edit, and develop the Rentala Platform from within VS Code!** 🚀
