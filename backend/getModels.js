require('dotenv').config();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const urls = [
  `https://generativelanguage.googleapis.com/v1alpha/models?key=${GEMINI_API_KEY}`,
  `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`,
  `https://generativelanguage.googleapis.com/v1/models?key=${GEMINI_API_KEY}`
];

Promise.all(urls.map(url => fetch(url).then(res => res.json())))
  .then(results => {
    results.forEach((data, i) => {
      console.log("URL index:", i);
      if (data.models) {
         const bidi = data.models.filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('bidiGenerateContent'));
         bidi.forEach(m => console.log(m.name));
      } else {
         console.log(data);
      }
    });
  });
