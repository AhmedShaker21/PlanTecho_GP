const GEMINI_API_KEY = "AIzaSyD-d9PhyX6oQ_aGhwJugAf0JX9L5Sz1tIU"; // Replace with your actual API key
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// Function to add a message to the chat box
function addMessage(message, sender) {
    const chatBox = document.getElementById("chatBox");
    const messageDiv = document.createElement("div");
    messageDiv.className = sender === "user" ? "user-message" : "bot-message";
    messageDiv.textContent = message;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom
}

// Function to check if the input is about plants and diseases
function isAboutPlantsAndDiseases(input) {
    // List of keywords related to plants and diseases
    const plantKeywords = ["plant", "plants", "tree", "trees", "flower", "flowers", "leaf", "leaves", "stem", "roots"];
    const diseaseKeywords = ["disease", "diseases", "fungus", "fungi", "pest", "pests", "infection", "rot", "blight", "mold"];

    // Convert input to lowercase for case-insensitive matching
    const lowerInput = input.toLowerCase();

    // Check if the input contains any plant or disease keywords
    const isAboutPlants = plantKeywords.some(keyword => lowerInput.includes(keyword));
    const isAboutDiseases = diseaseKeywords.some(keyword => lowerInput.includes(keyword));

    return isAboutPlants || isAboutDiseases;
}

// Function to handle sending a message
async function sendMessage() {
    const userInput = document.getElementById("userInput").value.trim();

    if (!userInput) {
        alert("Please enter a message.");
        return;
    }

    // Add user's message to the chat box
    addMessage(userInput, "user");

    // Clear the input field
    document.getElementById("userInput").value = "";

    // Check if the input is about plants and diseases
    if (!isAboutPlantsAndDiseases(userInput)) {
        addMessage("sorry , i can not answer.", "bot");
        return; // Exit the function if the input is unrelated
    }

    // Show loading indicator
    addMessage("Bot is typing...", "bot");

    try {
        // Prepare the request payload
        const payload = {
            contents: [
                {
                    role: "user",
                    parts: [{ text: userInput }],
                },
            ],
        };

        // Make a POST request to the Gemini API
        const response = await fetch(GEMINI_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        // Parse the response
        const data = await response.json();
        console.log("API Response:", data); // Log the full response for debugging

        // Extract the bot's response
        const botResponse = data.candidates[0].content.parts[0].text || "I couldn't generate a response.";

        // Remove the loading message
        const chatBox = document.getElementById("chatBox");
        chatBox.removeChild(chatBox.lastChild);

        // Add the bot's response to the chat box
        addMessage(botResponse, "bot");
    } catch (error) {
        console.error("Error communicating with Gemini API:", error);
        const chatBox = document.getElementById("chatBox");
        chatBox.removeChild(chatBox.lastChild); // Remove the loading message
        addMessage("Oops! Something went wrong. Please try again.", "bot");
    }
}

// Function to toggle the chatbot's visibility
function toggleChat() {
    const chatContainer = document.getElementById("chatContainer");
    chatContainer.style.display = chatContainer.style.display === "block" ? "none" : "block";
}

// Show the chatbot when the button is clicked
document.getElementById("chatToggleBtn").addEventListener("click", () => {
    toggleChat();
});
