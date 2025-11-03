# Statistical Sentiment Analysis by Shikher

An advanced web application by Shikher for analyzing sentiment from text data. It provides detailed sentiment scores, confidence levels, aspect-based analysis, and statistical validation, all powered by the Gemini API.

This is a comprehensive tool designed for developers, data analysts, and researchers to gain deep insights from textual data.

## ✨ Features

- **Single Text Analysis**: Get an instant sentiment analysis for any piece of text. Results include overall sentiment (positive, negative, neutral), a confidence score, and a breakdown of sentiment scores.
- **Aspect-Based Sentiment**: Goes beyond overall sentiment to identify specific aspects or topics within the text and analyzes their individual sentiment.
- **Batch Analysis**: Upload a `.txt` or `.csv` file containing multiple lines of text to perform batch processing. The results are displayed in an interactive table and visualized in charts.
- **Statistical Dashboard**: An interactive dashboard provides a high-level overview of analysis data (using mock data for demonstration), including sentiment distribution and trends over time.
- **AI-Powered Reporting**: Leverage the power of Gemini Pro to generate a comprehensive, human-readable report from the statistical data, complete with insights and recommendations.
- **Analysis History**: All analyses are saved (mock data) and can be viewed and searched in the history tab, providing a complete log of your work.
- **Configurable Models**: The application simulates various sentiment analysis models (e.g., VADER, BERT), using Gemini's capabilities to adapt its analysis style.
- **Robust Error Handling**: Clear and user-friendly error messages for API issues, ensuring a smooth user experience.

## 🚀 How to Use

1.  **Select a Tab**: Choose from `Single Analysis`, `Batch Analysis`, `Statistics`, or `History` to access different functionalities.
2.  **Single Analysis**:
    -   Enter your text into the provided textarea.
    -   Select a conceptual analysis model from the dropdown.
    -   Click "Analyze Sentiment" to see the results.
3.  **Batch Analysis**:
    -   Click the upload button to select a `.txt` or `.csv` file (one text entry per line).
    -   Once the file is loaded, click "Analyze Texts" to start the batch process.
    -   View the progress and see results populate in the table and charts. You can download the full results as a CSV.
4.  **Statistics**:
    -   Explore the interactive charts and metrics on the dashboard.
    -   Click "Generate Full Report" to have Gemini create a detailed analytical summary, which you can then download as a PDF.
5.  **History**:
    -   Browse the list of previous analysis records.
    -   Use the search bar at the top to filter the history by text content, sentiment, or model used.

## 🛠️ Technology Stack

- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS
- **AI Model**: Google Gemini API (`gemini-2.5-flash` for analysis, `gemini-2.5-pro` for reporting)
- **Charting Library**: Recharts
- **PDF Generation**: jsPDF

## 📦 Deployment Instructions

**Important:** This is a **React/TypeScript** web application, not a Python application. You **cannot** deploy it on platforms like Streamlit, which are designed for Python. Doing so will result in errors like the one you encountered.

You must deploy this project as a **static web application**. Here are the general steps:

1.  **Choose a Hosting Provider**: Select a service that specializes in hosting static sites. Excellent free options include:
    -   [Vercel](https://vercel.com/)
    -   [Netlify](https://www.netlify.com/)
    -   [GitHub Pages](https://pages.github.com/)

2.  **Connect Your Git Repository**: Connect the GitHub repository containing this project to your chosen hosting provider.

3.  **Configure Build Settings**: The hosting provider will need to know how to build your site. While this project runs directly in a specialized environment, a standard React app would use these settings:
    -   **Build Command**: `npm run build` or `vite build`
    -   **Publish Directory**: `dist` or `build`

4.  **Deploy**: The platform will automatically build your project and deploy the resulting static files (HTML, CSS, JavaScript) to their global network.

By following these instructions, your application will be deployed correctly and will be accessible to users via a public URL.

---
*Innovated and Designed by Shikher for advanced AI-powered analytics.*