const https = require('https');

const callGroqAPI = (prompt) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500,
      temperature: 0.7,
    });

    const options = {
      hostname: 'api.groq.com',
      path: '/openai/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Length': Buffer.byteLength(data),
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve(parsed.choices?.[0]?.message?.content || '');
        } catch (e) {
          reject(new Error('Failed to parse Groq response'));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
};

// @desc    Generate questions using AI
// @route   POST /api/ai/generate-questions
exports.generateQuestions = async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      return res.status(400).json({ success: false, message: 'GROQ_API_KEY not configured' });
    }

    const { topic, count, difficulty, type } = req.body;

    const prompt = `Generate ${count || 5} ${difficulty || 'medium'} difficulty ${type || 'MCQ'} questions about "${topic}".

Return ONLY a JSON array with this exact format (no markdown, no explanation):
[
  {
    "questionText": "Question here?",
    "type": "mcq",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "marks": 1,
    "difficulty": "${difficulty || 'medium'}",
    "explanation": "Brief explanation of correct answer"
  }
]

For true/false: options should be ["True", "False"].
For short_answer: options should be [].
Ensure correctAnswer exactly matches one of the options.`;

    const response = await callGroqAPI(prompt);

    let questions = [];
    try {
      const cleanResponse = response.replace(/```json|```/g, '').trim();
      questions = JSON.parse(cleanResponse);
    } catch (e) {
      return res.status(500).json({ success: false, message: 'AI returned invalid format. Try again.' });
    }

    res.json({ success: true, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate performance feedback
// @route   POST /api/ai/feedback
exports.generateFeedback = async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      return res.status(400).json({ success: false, message: 'GROQ_API_KEY not configured' });
    }

    const { score, totalMarks, percentage, subject, wrongTopics, timeTaken, examTitle } = req.body;

    const prompt = `A student just completed an exam. Provide personalized performance feedback.

Exam: ${examTitle || subject}
Score: ${score}/${totalMarks} (${percentage}%)
Topics with wrong answers: ${wrongTopics?.join(', ') || 'Various topics'}
Time taken: ${Math.floor(timeTaken / 60)} minutes

Write 3-4 sentences of encouraging, specific, actionable feedback:
1. Acknowledge their performance
2. Highlight what they did well or areas to improve
3. Give specific study suggestions
4. Motivational closing

Keep it concise and personalized. No markdown, plain text only.`;

    const feedback = await callGroqAPI(prompt);
    res.json({ success: true, feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate exam difficulty assessment
// @route   POST /api/ai/difficulty
exports.assessDifficulty = async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      return res.status(400).json({ success: false, message: 'GROQ_API_KEY not configured' });
    }

    const { questions } = req.body;
    const sampleQuestions = questions?.slice(0, 5).map(q => q.questionText).join('\n');

    const prompt = `Assess the difficulty level of this exam based on these sample questions:

${sampleQuestions}

Respond with ONLY valid JSON:
{
  "overallDifficulty": "easy|medium|hard",
  "score": 1-10,
  "breakdown": {
    "conceptualDepth": "assessment",
    "vocabulary": "assessment",
    "timeRequired": "assessment"
  },
  "recommendation": "one sentence recommendation"
}`;

    const response = await callGroqAPI(prompt);
    const clean = response.replace(/```json|```/g, '').trim();
    const assessment = JSON.parse(clean);

    res.json({ success: true, data: assessment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
