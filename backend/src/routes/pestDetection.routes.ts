import express from 'express';
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');

const router = express.Router();
const upload = multer();

router.post('/ai/detect-pests', upload.single('image'), async (req: any, res: any) => {
  try {
    const apiKey = '7Wt1J1aTJd4FjE3kMW60';
    const modelEndpoint = 'https://serverless.roboflow.com/pest_detection-bwb31/1';
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    // Prepare multipart/form-data
    const formData = new FormData();
    formData.append('file', file.buffer, file.originalname);

    const response = await axios({
      method: 'POST',
      url: `${modelEndpoint}?api_key=${apiKey}`,
      data: formData,
      headers: {
        ...formData.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    // Debug: log the full Roboflow response
    console.log('Roboflow response:', response.data);

    let predictions = (response.data && typeof response.data === 'object' && 'predictions' in response.data)
      ? response.data.predictions
      : response.data;
    if (Array.isArray(predictions)) {
      predictions = predictions.map((p: any) => ({ ...p, score: p.confidence ?? p.score ?? 0 }));
    }
    res.json({ predictions });
  } catch (error: any) {
    // Debug: log error details
    console.error('Roboflow API error:', error?.response?.data || error?.message || error);
    res.status(500).json({ message: 'Prediction failed', error: error?.message });
  }
});

// To try multipart/form-data instead of base64, use:
// const formData = new FormData();
// formData.append('file', file.buffer, file.originalname);
// and set headers: { ...formData.getHeaders() }

export default router; 