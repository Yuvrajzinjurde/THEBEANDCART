
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
<<<<<<< HEAD
  model: 'googleai/gemini-1.5-flash-latest',
=======
  model: 'gemini-pro',
>>>>>>> 81a0047e5ec12db80da74c44e0a5c54d6cfcaa25
});
