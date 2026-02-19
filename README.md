# CineBucket Scraper & Client Architecture

This project consists of an automated movie scraper that feeds data into the CineBucket streaming platform.

## Architecture Overview

The system is divided into two main parts:

### 1. Data Provider (The Scraper)
*   **Technology**: Python / Flask
*   **Function**: Scrapes `mkvking.fans` for movie links and enriched metadata.
*   **Enrichment**: Uses the **TMDB API** to fetch high-quality posters, backdrops, genres, and ratings.
*   **Storage**: Optimizes images by uploading them to **Cloudinary** if they are only available on the source site.
*   **Endpoint**: `/api/movies` (POST) - Fetches a specific page of movies.

### 2. Client Side (The Web App)
*   **URL**: [cinebucket.vercel.app](https://cinebucket.vercel.app)
*   **Technology**: Node.js / Next.js
*   **Data Flow**:
    1.  A **Vercel Cron Job** (`api/scrape.js`) triggers the scraper.
    2.  The scraper returns a JSON object with enriched movie data.
    3.  The data is saved as a JSON file in **Vercel Blob Storage**.
    4.  The Frontend reads the JSON from Blob Storage to display the latest movies.

## Scraping Workflow

1.  **Listing Fetch**: The scraper visits the configured listing page (default: `mkvking.fans`).
2.  **Concurrency**: It processes multiple movie URLs in parallel for speed.
3.  **Bypassing Protection**:
    *   Individual movie pages often hide their content behind "Skip Ad" walls.
    *   The scraper uses **Metadata Fallbacks** (meta tags, JSON-LD, body classes) to extract details even when the body is hidden.
4.  **Enrichment**: Movie names are cleaned (e.g., removing site branding) and searched on TMDB to fill in missing details like Genres and Duration.

## Installation & Running Locally

1.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
2.  **Setup Environment Variables**:
    Create a `.env` file based on `.env.example`.
3.  **Run the API**:
    ```powershell
    $env:FLASK_APP = "api/movies.py"
    python -m flask run
    ```

## API Usage

### Fetch Movies
**POST** `/api/movies`
```json
{
  "page": 1,
  "max_workers": 8
}
```

### Health Check
**GET** `/api/health`
