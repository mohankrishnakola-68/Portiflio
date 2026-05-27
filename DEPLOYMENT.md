# 🚀 Deployment Guide: Full-Stack Personal Portfolio

Follow these instructions to deploy your database, Express backend API, and React frontend to the web for free.

---

## 💾 Step 1: Deploy MongoDB Database (MongoDB Atlas)

Since your local database is on `localhost`, you need a cloud database that can be accessed by your deployed backend.

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and create a free account.
2. Build a new database cluster and choose the **M0 Free Shared Tier**.
3. Under **Database Access**, create a database user (write down the username and password).
4. Under **Network Access**, click **Add IP Address** -> select **Allow Access from Anywhere** (`0.0.0.0/0`) -> click **Confirm**.
5. Go to **Database** -> click **Connect** on your cluster -> select **Drivers**.
6. Copy the connection string. It will look like this:
   ```text
   mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   *(Be sure to replace `<username>` and `<password>` with the database user credentials you created).*

---

## 🖥️ Step 2: Deploy the Express Backend (Render.com)

1. Go to [Render.com](https://render.com/) and sign up with your GitHub account.
2. Click **New +** in the dashboard and select **Web Service**.
3. Link your GitHub repository (`Portiflio`).
4. Set the following settings:
   * **Name:** `portfolio-api`
   * **Root Directory:** `backend`
   * **Runtime:** `Node`
   * **Build Command:** `npm install`
   * **Start Command:** `npm start`
5. Scroll down and click **Advanced** -> click **Add Environment Variable**:
   * Add Key: `PORT` | Value: `5000`
   * Add Key: `MONGODB_URI` | Value: *(Paste your MongoDB Atlas connection string from Step 1)*
6. Click **Deploy Web Service**.
7. Wait for the build to complete. Once deployed, copy your backend URL (e.g., `https://portfolio-api-xxxx.onrender.com`).

---

## 💻 Step 3: Deploy the React Frontend (Vercel)

Before deploying the frontend, we must configure it to talk to your new live backend instead of `localhost`.

### A. Update your Local Code
1. Open `frontend/src/App.jsx` in VS Code.
2. Find the API URL setting (around line 9):
   ```javascript
   const API_URL = 'http://localhost:5000/api';
   ```
3. Change it to your live Render URL (with `/api` at the end):
   ```javascript
   const API_URL = 'https://portfolio-api-xxxx.onrender.com/api';
   ```
4. Commit and push this change to GitHub:
   ```bash
   git commit -am "Update backend API endpoint to production"
   git push
   ```

### B. Link to Vercel
1. Go to [Vercel.com](https://vercel.com/) and sign up with your GitHub account.
2. Click **Add New** -> **Project**.
3. Import your `Portiflio` repository.
4. On the configuration screen:
   * **Framework Preset:** Select **`Vite`**.
   * **Root Directory:** Click **Edit** and select the **`frontend`** folder.
5. Click **Deploy**.
6. Once completed, Vercel will provide you with your live portfolio website URL!
