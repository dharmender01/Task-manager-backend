const axios = require('axios');
const csv = require('csv-parser');

const fetchSheetData = async (url) => {
  // Validate Google Sheets URL
  const sheetIdMatch = url.match(/\/d\/(.*?)\//);
  if (!sheetIdMatch) throw new Error("Invalid Google Sheets URL");
  
  const sheetId = sheetIdMatch[1];

  // Construct the CSV export URL
  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
  const results = [];

  try {
    // Fetch the CSV data from Google Sheets
    const response = await axios.get(csvUrl, { responseType: 'stream' });

    // Parse the CSV data
    return new Promise((resolve, reject) => {
      response.data
        .pipe(csv())
        .on('data', (data) => results.push(data)) // Push data to results
        .on('end', () => resolve(results))        // Resolve with the parsed data
        .on('error', (err) => reject(err));       // Reject on error
    });
  } catch (err) {
    console.error('Error fetching or parsing Google Sheets data:', err);
    throw new Error('Failed to fetch and parse data from Google Sheets');
  }
};

module.exports = fetchSheetData;
