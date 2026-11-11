// Address of the Express API. Override with VITE_API_BASE_URL in a .env file at the project root.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const APP_NAME = 'CampusBridge';
export const APP_TAGLINE = 'Your bridge to academic excellence & career opportunities';

// Optional public contact address shown in the footer. Leave VITE_CONTACT_EMAIL unset to hide it.
export const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || '';

// The courses and opportunities that ship with the project are SAMPLE data for demonstration.
// Set to false once you replace them with real listings.
export const SHOW_SAMPLE_DATA_NOTICE = true;

export const YEARS_OF_STUDY = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Graduate'];
