const voices = window.speechSynthesis.getVoices();
utterance.voice = voices[0]; // Select a voice from the available list


utterance.rate = 1; // Normal speed (0.5 to 2)
utterance.pitch = 1; // Normal pitch (0 to 2)

utterance.lang = 'en-US'; // Set language (e.g., 'es-ES' for Spanish)


let singingInterval;  // Interval to manage continuous singing

function startSinging() {
    const lyrics = "La la la..."; // Define the lyrics for the AI to "sing"

    // Function to "sing" each phrase
    function singPhrase() {
        const utterance = new SpeechSynthesisUtterance(lyrics);
        utterance.volume = 1;      // Volume (0 to 1)
        utterance.rate = 1;        // Speed (adjust to simulate singing)
        utterance.pitch = 1.5;     // Pitch (higher for a more sing-song effect)
        
        window.speechSynthesis.speak(utterance);
    }

    // Set up an interval to repeat the phrase, simulating continuous singing
    singingInterval = setInterval(singPhrase, 2000); // Adjust timing as desired
    singPhrase(); // Start immediately
}

function stopSinging() {
    // Stop any ongoing speech and clear the interval to stop continuous singing
    window.speechSynthesis.cancel();
    clearInterval(singingInterval);
}


function readAllText() {
    // Get all text inside the #content container
    const content = document.getElementById("content");
    const text = content.innerText;

    // Use Web Speech API to read the text
    const speech = new SpeechSynthesisUtterance();
    speech.text = text;
    speech.volume = 1;      // Volume (0 to 1)
    speech.rate = 1;        // Speed (0.1 to 10)
    speech.pitch = 1;       // Pitch (0 to 2)

    // Start speaking the text
    window.speechSynthesis.speak(speech);
}

// Optional: Stop any ongoing speech when the user clicks a stop button
function stopReading() {
    window.speechSynthesis.cancel();
}


async function calculateAI() {
    const input = document.getElementById('inputField').value;
    const resultElement = document.getElementById('result');

    try {
        // Send input to AI API (replace with your API endpoint and key)
        const response = await fetch('https://your-api-endpoint.com/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_API_KEY'
            },
            body: JSON.stringify({ query: input })
        });

        const data = await response.json();
        resultElement.textContent = "AI Result: " + data.result;
    } catch (error) {
        resultElement.textContent = "Error: Could not calculate";
    }
}




