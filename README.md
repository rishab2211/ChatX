# ChatX - Realtime Chat Application 💬

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**ChatX** is a feature-rich, real-time chat application built with modern web technologies. It allows users to connect via direct messages and group channels, share files, and customize their experience.

**🚀 Live Demo:** [**Try ChatX Now!**](https://chat-x-three-gamma.vercel.app/)

---

## ✨ Features

* **🔐 Secure Authentication:** User registration and login using email and password.
* **👤 Profile Management:** Customize your profile with personal information and a profile picture.
* **🔍 User Discovery:** Easily search for and find other registered users.
* **✉️ Direct Messaging (DM):**
    * Initiate one-on-one conversations.
    * Maintain a contact list of users you've chatted with.
    * Real-time updates: DMs with new messages automatically move to the top of your list.
* **📢 Channels:**
    * Create public or private channels.
    * Invite contacts to join your channels.
    * Browse and participate in channels you are a member of.
    * Real-time updates: Channels with new activity rise to the top.
* **💬 Rich Messaging:**
    * Send and receive text messages instantly.
    * Share images and files within DMs and channels.
* **📜 Persistent Chat History:** Access previous messages when reopening a chat or channel.
* **🎨 Theme Customization:** Choose between Light, Dark, or System default themes for personalized viewing comfort.

---

## 🖼️ Demo / Screenshots

![ChatX Demo GIF](server/assets/ChatX-demo.gif)

---

## 🛠️ Tech Stack

* **Frontend:**
    * **React:** Core UI library.
    * **Tailwind CSS:** Utility-first CSS framework for styling.
    * **Shadcn UI:** Reusable and accessible UI components.
    * **Zustand:** Minimalist global state management.
* **Backend:**
    * **Node.js & Express.js:** For building the server-side API.
    * **Socket.IO:** For enabling real-time, bidirectional communication.
* **Database:**
    * **MongoDB:** NoSQL database for storing user data, messages, and channel information.
    * **Mongoose:** Object Data Modeling (ODM) library for MongoDB and Node.js.

---

## 🚀 Getting Started

Follow these instructions to set up the project locally for development and testing.

### Prerequisites

* **Node.js:** v18.x or later ([Download](https://nodejs.org/))
* **NPM or Yarn:** Package manager (NPM comes with Node.js)
* **MongoDB:** A running MongoDB instance (local or cloud-based like MongoDB Atlas).
* **Git:** Version control system ([Download](https://git-scm.com/))

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone chttps://github.com/rishab2211/ChatX.git
    cd ChatX
    ```

2.  **Install Server Dependencies:**
    ```bash
    cd server
    npm install
    ```

3.  **Install Client Dependencies:**
    ```bash
    cd ../client
    npm install
    ```

4.  **Set up Environment Variables:**

    You need to create a `.env` file in both the `/server` and `/client` directories.

    #### Server-Side (`/server/.env`)
    Create a `.env` file in the `/server` folder and add the following, replacing the placeholder values:
    ```env
    # The port your back-end server will run on
    PORT=3000

    # A secret key for creating/verifying JSON Web Tokens (JWT) for authentication
    # Replace "secret_key" with a long, random, and secure string
    JWT_KEY="your_super_secret_key_here"

    # The URL of your front-end application for CORS (Cross-Origin Resource Sharing)
    ORIGIN="http://localhost:5173"

    # The connection string for your MongoDB database
    DB_URL="mongodb+srv://<user>:<password>@cluster.mongodb.net/yourDatabaseName"
    ```

    #### Client-Side (`/client/.env`)
    Create a `.env` file in the `/client` folder and add the following:
    ```env
    # This variable tells your front-end application the address of your back-end server.
    VITE_SERVER_URL=http://localhost:3000
    ```

5.  **Run the Backend Server:**
    ```bash
    cd server
    npm run dev
    ```

6.  **Run the Frontend Application (in a new terminal):**
    ```bash
    cd client
    npm run dev
    ```

7.  **Access the Application:**
    Open your browser and navigate to `http://localhost:5173` (or the port specified by Vite in your terminal).

---

## 📖 Usage

1.  **Register a new account** or log in with existing credentials.
2.  **Update your profile** information and picture via the profile settings.
3.  Use the **search bar** to find other users.
4.  Click on a user to start a **direct message** conversation.
5.  **Create new channels** and add members from your contact list.
6.  Send text messages, emojis, images, or files in chats and channels.
7.  Switch between **Light/Dark/System themes** in the settings.
