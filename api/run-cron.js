// api/run-cron.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  try {
    // 1. Call the Frontend API which triggers the Scraper API and saves data to DB
    const response = await fetch('https://cinebucket-eight.vercel.app/api/sync');

    if (!response.ok) {
      throw new Error(`Failed to fetch Frontend Sync API: ${response.status}`);
    }

    const result = await response.json();

    console.log('✅ Successfully completed sync flow:', result);

    res.status(200).json({ success: true, result });

  } catch (error) {
    console.error('❌ Error in cron run:', error);
    res.status(500).json({ error: error.message });
  }
}
