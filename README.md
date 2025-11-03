# Statistical Sentiment Analysis by Shikher

An advanced web application by Shikher for analyzing sentiment from text data. It provides detailed sentiment scores, confidence levels, aspect-based analysis, and statistical validation, all powered by the Gemini API.

---

## 🚀 Vercel Deployment Guide

This project is currently structured to run in a specific online coding environment (like Google's AI Studio) that handles the build process automatically. To deploy it to a professional hosting platform like **Vercel**, you first need to set it up as a standard web application project.

Follow these steps carefully. This will create a new, deployable version of your app on your local machine.

### Step 1: Create a New Project with Vite

First, create a new, standard React + TypeScript project on your computer using Vite. Open your terminal and run this command:

```bash
npm create vite@latest statistical-sentiment-app -- --template react-ts
```

This creates a new folder named `statistical-sentiment-app`. Navigate into it:

```bash
cd statistical-sentiment-app
```

### Step 2: Install Project Dependencies

Next, install the necessary libraries (dependencies) that your app uses.

```bash
npm install @google/genai recharts jspdf
```

Then, install the dependencies needed for styling with Tailwind CSS:

```bash
npm install -D tailwindcss postcss autoprefixer
```

### Step 3: Configure Tailwind CSS

Run the following command to create the necessary Tailwind configuration files (`tailwind.config.js` and `postcss.config.js`):

```bash
npx tailwindcss init -p
```

Now, open the newly created `tailwind.config.js` file and replace its content with this:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### Step 4: Add Tailwind's CSS Styles

Create a new file at `src/index.css` and add the following lines to it. This file will contain the base styles for Tailwind.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Step 5: Copy Your Application Code

1.  **Delete the template files**: In the new `statistical-sentiment-app` folder, delete all the files inside the `src` directory.
2.  **Copy your code**:
    *   Copy your `App.tsx`, `index.tsx`, `types.ts`, the `components` folder, and the `services` folder into the now-empty `src` directory.
    *   Replace the `index.html` file in the root of the `statistical-sentiment-app` folder with your project's `index.html`.

Your new project structure should look like this:

```
statistical-sentiment-app/
├── public/
├── src/
│   ├── App.tsx
│   ├── index.css       <- The file you created in Step 4
│   ├── index.tsx
│   ├── types.ts
│   ├── components/
│   └── services/
├── index.html          <- Your updated index.html
├── package.json
└── ... (other config files)
```

### Step 6: Final Code Adjustments

Make two final, small changes to link everything together:

1.  **In `index.html`**:
    *   Remove the entire `<script type="importmap">...</script>` block.
    *   Remove the `<script src="https://cdn.tailwindcss.com"></script>` line.
    *   Remove the `<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>` line.
    *   Change the final script tag from `<script type="module" src="/index.tsx"></script>` to:
        ```html
        <script type="module" src="/src/index.tsx"></script>
        ```

2.  **In `src/index.tsx`**:
    *   Add this line at the very top of the file to import the CSS styles:
        ```javascript
        import './index.css';
        ```

### Step 7: Push to GitHub

Your project is now ready! Initialize a Git repository, commit your files, and push them to a new repository on your GitHub account.

```bash
git init
git add .
git commit -m "Initial commit of deployable app"
git branch -M main
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```

### Step 8: Deploy on Vercel

1.  Sign up or log in to [Vercel](https://vercel.com/) with your GitHub account.
2.  On your dashboard, click **"Add New... > Project"**.
3.  Import the GitHub repository you just pushed to.
4.  Vercel will automatically detect that it's a **Vite** project. It will pre-fill all the correct build settings.
5.  Click **"Deploy"**.

Vercel will now build and deploy your application. Once it's finished, you will get a public URL where you can view your live app. Congratulations!

---
*Innovated and Designed by Shikher for advanced AI-powered analytics.*
