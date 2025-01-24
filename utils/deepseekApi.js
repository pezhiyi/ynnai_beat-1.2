const DEEPSEEK_API_KEY = 'sk-e1d5ca152f454dc0b3c2f74d6e21cba3';
const API_URL = 'https://api.deepseek.com/v1/chat/completions';

export async function callDeepseekApi(messages) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        temperature: 0.7,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling Deepseek API:', error);
    throw error;
  }
}
