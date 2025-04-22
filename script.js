// API Keys and URLs
const GEMINI_API_KEY = "AIzaSyD-d9PhyX6oQ_aGhwJugAf0JX9L5Sz1tIU"; // Replace with your actual API key
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// Speech recognition setup
let recognition;
let isListening = false;
let speechSynthesis = window.speechSynthesis;
let currentLanguage = "en"; // Default language
let voices = [];

// Initialize speech recognition
function initSpeechRecognition() {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        
        // Critical settings for better language support
        recognition.continuous = false;
        recognition.interimResults = true; // Get interim results for better Arabic recognition
        recognition.maxAlternatives = 3; // Get multiple alternatives for better accuracy
        
        // Initialize with current language
        recognition.lang = getLanguageCode(currentLanguage);
        
        // Handle results
        recognition.onresult = (event) => {
            let finalTranscript = '';
            
            // Build transcript from all results
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            
            // If we have a final transcript
            if (finalTranscript !== '') {
                document.getElementById("userInput").value = finalTranscript;
                
                // Update current language based on detected language in transcript
                currentLanguage = detectLanguage(finalTranscript);
                
                // Submit only when we have a final result
                if (event.results[event.results.length - 1].isFinal) {
                    sendMessage(true); // true indicates voice input
                }
            }
        };

        // Handle errors
        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            stopListening();
            const errorMsg = currentLanguage === "ar" ?
                "حدث خطأ في التعرف على الصوت" : "Voice recognition error";
            showToast(errorMsg);
        };

        // Handle end of speech
        recognition.onend = () => {
            if (isListening) {
                // If we're still supposed to be listening, restart
                // This creates a semi-continuous experience without the limitations
                // of continuous mode, which can be problematic for Arabic
                try {
                    recognition.start();
                } catch (e) {
                    console.error("Could not restart recognition", e);
                    isListening = false;
                    updateMicButtonState();
                }
            } else {
                stopListening();
            }
        };
    } else {
        // If speech recognition is not supported
        const micButton = document.getElementById("micButton");
        micButton.disabled = true;
        micButton.title = currentLanguage === "ar" ? 
            "التعرف على الصوت غير مدعوم في هذا المتصفح" : 
            "Speech recognition not supported in this browser";
    }
    
    // Initialize speech synthesis voices
    initVoices();
}

// Initialize speech synthesis voices
function initVoices() {
    // Get available voices
    voices = speechSynthesis.getVoices();
    
    // If no voices available yet, wait for them to load
    if (voices.length === 0) {
        speechSynthesis.onvoiceschanged = () => {
            voices = speechSynthesis.getVoices();
            console.log("Available voices loaded:", voices.length);
        };
    } else {
        console.log("Available voices:", voices.length);
    }
}

// Start listening for voice input
function startListening() {
    if (recognition && !isListening) {
        try {
            // Set language based on current UI language or input box content
            updateRecognitionLanguage();
            
            console.log(`Starting speech recognition in ${recognition.lang}`);
            recognition.start();
            isListening = true;
            updateMicButtonState();
            
            // Show recording indicator in current language
            showToast(currentLanguage === "ar" ? "جارٍ الاستماع..." : "Listening...");
        } catch (error) {
            console.error("Error starting speech recognition:", error);
            showToast("Error starting voice recognition");
        }
    }
}

// Update the recognition language based on the current detected language
function updateRecognitionLanguage() {
    // Get input value or last detected language
    const inputText = document.getElementById("userInput").value;
    
    // If there's text, detect its language
    if (inputText.trim()) {
        currentLanguage = detectLanguage(inputText);
    }
    
    // Set recognition language and update UI
    if (recognition) {
        recognition.lang = getLanguageCode(currentLanguage);
        console.log(`Recognition language set to: ${recognition.lang}`);
    }
    
    // Update UI direction
    updateDocumentDirection();
}

// Get appropriate language code for speech API
function getLanguageCode(lang) {
    const languageCodes = {
        "ar": "ar-SA", // Arabic (Saudi Arabia)
        "en": "en-US"  // English (United States)
    };
    
    return languageCodes[lang] || "en-US"; // Default to English if unknown
}

// Stop listening for voice input
function stopListening() {
    if (recognition && isListening) {
        try {
            recognition.stop();
        } catch (error) {
            console.error("Error stopping speech recognition:", error);
        }
        isListening = false;
        updateMicButtonState();
    }
}

// Toggle listening state
function toggleListening() {
    if (isListening) {
        stopListening();
    } else {
        startListening();
    }
}

// Update microphone button appearance
function updateMicButtonState() {
    const micButton = document.getElementById("micButton");
    if (isListening) {
        micButton.classList.add("recording");
        micButton.innerHTML = '<i class="fas fa-microphone-alt"></i>';
    } else {
        micButton.classList.remove("recording");
        micButton.innerHTML = '<i class="fas fa-microphone"></i>';
    }
}

// Speak the text using speech synthesis
function speakText(text, language) {
    if (speechSynthesis) {
        // Cancel any ongoing speech
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = getLanguageCode(language);
        
        // Find appropriate voice for the language
        const availableVoices = speechSynthesis.getVoices();
        let voiceFound = false;
        
        // First try to find a native voice for the language
        for (let voice of availableVoices) {
            if (voice.lang.startsWith(language === "ar" ? "ar" : "en")) {
                utterance.voice = voice;
                voiceFound = true;
                console.log(`Using voice: ${voice.name} (${voice.lang})`);
                break;
            }
        }
        
        // If no specific language voice found, use default
        if (!voiceFound) {
            console.log("No specific voice found for language, using default");
        }
        
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        
        speechSynthesis.speak(utterance);
    }
}

// Show toast notification
function showToast(message, duration = 3000) {
    const toast = document.getElementById("toast");
    
    if (!toast) {
        // Create toast element if it doesn't exist
        const newToast = document.createElement("div");
        newToast.id = "toast";
        newToast.className = "toast";
        document.body.appendChild(newToast);
        toast = newToast;
    }
    
    toast.textContent = message;
    toast.classList.add("show");
    
    // Set text direction for toast
    const toastLang = detectLanguage(message);
    toast.style.direction = toastLang === "ar" ? "rtl" : "ltr";
    
    setTimeout(() => {
        toast.classList.remove("show");
    }, duration);
}

// Function to add a message to the chat box
function addMessage(message, sender, isVoiceInput = false) {
    const chatBox = document.getElementById("chatBox");
    
    // Remove typing indicator if it exists
    const typingIndicator = document.getElementById("typingIndicator");
    if (typingIndicator) {
        chatBox.removeChild(typingIndicator);
    }
    
    // Create message container
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${sender}-message`;
    
    // Set text direction based on language
    const detectedLang = detectLanguage(message);
    messageDiv.style.direction = detectedLang === "ar" ? "rtl" : "ltr";
    
    // Create message content
    const messageContent = document.createElement("div");
    messageContent.className = "message-content";
    
    // Add avatar
    const avatar = document.createElement("div");
    avatar.className = "avatar";
    if (sender === "user") {
        avatar.innerHTML = '<i class="fas fa-user"></i>';
    } else {
        avatar.innerHTML = '<i class="fas fa-leaf"></i>';
    }
    
    // Add text bubble
    const textBubble = document.createElement("div");
    textBubble.className = "text-bubble";
    textBubble.textContent = message;
    
    // Assemble message
    messageContent.appendChild(avatar);
    messageContent.appendChild(textBubble);
    messageDiv.appendChild(messageContent);
    
    // Add timestamp
    const timestamp = document.createElement("div");
    timestamp.className = "timestamp";
    const now = new Date();
    timestamp.textContent = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    messageDiv.appendChild(timestamp);
    
    // Add voice indicator if message was spoken
    if (isVoiceInput && sender === "user") {
        const voiceIndicator = document.createElement("div");
        voiceIndicator.className = "voice-indicator";
        voiceIndicator.innerHTML = '<i class="fas fa-microphone-alt"></i>';
        messageContent.appendChild(voiceIndicator);
    }
    
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom
    
    // If bot message, speak it if in voice mode
    if (sender === "bot" && isVoiceInput) {
        speakText(message, detectedLang);
    }
    
    // Update current language based on the most recent message
    if (sender === "user") {
        currentLanguage = detectedLang;
        updateDocumentDirection();
    }
}

// Add typing indicator with appropriate direction
function addTypingIndicator() {
    const chatBox = document.getElementById("chatBox");
    const indicatorDiv = document.createElement("div");
    indicatorDiv.id = "typingIndicator";
    indicatorDiv.className = "message bot-message";
    
    // Set appropriate text direction
    indicatorDiv.style.direction = currentLanguage === "ar" ? "rtl" : "ltr";
    
    const messageContent = document.createElement("div");
    messageContent.className = "message-content";
    
    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.innerHTML = '<i class="fas fa-leaf"></i>';
    
    const textBubble = document.createElement("div");
    textBubble.className = "text-bubble typing-indicator";
    textBubble.innerHTML = '<span></span><span></span><span></span>';
    
    messageContent.appendChild(avatar);
    messageContent.appendChild(textBubble);
    indicatorDiv.appendChild(messageContent);
    
    chatBox.appendChild(indicatorDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Function to check if the input is about plants and diseases
function isAboutPlantsAndDiseases(input) {
    // Enhanced list of keywords related to plants and diseases (in Arabic and English)
    const plantKeywords = [
        // Arabic keywords
        "نبات", "نباتات", "شجرة", "أشجار", "زهرة", "زهور", "ورقة", "أوراق", "ساق", "جذور", 
        "بذور", "ثمرة", "ثمار", "بستنة", "زراعة", "ري", "تسميد", "تربة", "حديقة", "محصول",
        // English keywords
        "plant", "plants", "tree", "trees", "flower", "flowers", "leaf", "leaves", "stem", "roots",
        "seeds", "fruit", "fruits", "gardening", "farming", "irrigation", "fertilizer", "soil", "garden", "crop",
        "agriculture", "horticulture", "cultivation", "grow", "growing", "planting", "farm", "harvest"
    ];
    
    const diseaseKeywords = [
        // Arabic keywords
        "مرض", "أمراض", "فطر", "فطريات", "آفة", "آفات", "عدوى", "تعفن", "لفحة", "عفن",
        "صدأ", "بياض", "اصفرار", "ذبول", "تبقع", "حشرات", "بق", "نيماتودا", "فيروس", "علاج",
        // English keywords
        "disease", "diseases", "fungus", "fungi", "pest", "pests", "infection", "rot", "blight", "mold",
        "mildew", "rust", "wilt", "yellowing", "spots", "insects", "bugs", "nematodes", "virus", "treatment",
        "symptom", "symptoms", "pathogen", "cure", "control", "prevention", "diagnosis", "infected"
    ];

    // For testing purposes, return true to allow all inputs during development
    // Remove this conditional for production
    if (input.includes("test")) {
        return true;
    }

    // Convert input to lowercase for case-insensitive matching
    const lowerInput = input.toLowerCase();

    // Check if the input contains any plant or disease keywords
    const isAboutPlants = plantKeywords.some(keyword => lowerInput.includes(keyword));
    const isAboutDiseases = diseaseKeywords.some(keyword => lowerInput.includes(keyword));

    return isAboutPlants || isAboutDiseases;
}

// Function to detect the language of the input
function detectLanguage(input) {
    if (!input || typeof input !== 'string') return "en";
    
    // Use a more comprehensive heuristic to detect Arabic
    // Arabic Unicode range: \u0600-\u06FF, \u0750-\u077F, \u08A0-\u08FF, \uFB50-\uFDFF, \uFE70-\uFEFF
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    
    // Count Arabic characters
    let arabicCount = 0;
    for (let i = 0; i < input.length; i++) {
        if (arabicRegex.test(input[i])) {
            arabicCount++;
        }
    }
    
    // If more than 20% of characters are Arabic, consider it Arabic
    return (arabicCount / input.length) > 0.2 ? "ar" : "en";
}

// Function to clean asterisks from Arabic text
function cleanAsteriskFormatting(text) {
    // Replace ** markers in Arabic text
    if (detectLanguage(text) === "ar") {
        // Replace double asterisks that are formatting markers
        return text.replace(/\*\*/g, '');
    }
    return text;
}

// Function to handle sending a message
async function sendMessage(fromVoice = false) {
    const userInput = document.getElementById("userInput").value.trim();

    if (!userInput) {
        const emptyMsg = currentLanguage === "ar" ? 
            "الرجاء إدخال رسالة" : "Please enter a message";
        showToast(emptyMsg);
        return;
    }

    // Log and detect language of current input
    console.log(`Processing input: "${userInput}"`);
    currentLanguage = detectLanguage(userInput);
    console.log(`Detected language: ${currentLanguage}`);

    // Add user's message to the chat box
    addMessage(userInput, "user", fromVoice);

    // Clear the input field
    document.getElementById("userInput").value = "";

    // Check if the input is about plants and diseases
    if (!isAboutPlantsAndDiseases(userInput)) {
        const errorMessage = currentLanguage === "ar" ?
            "عذرًا، أنا روبوت متخصص في النباتات والأمراض النباتية فقط. يرجى طرح سؤال متعلق بهذا المجال." :
            "Sorry, I'm a specialized bot for plants and plant diseases only. Please ask a question related to this domain.";
        addMessage(errorMessage, "bot", fromVoice);
        if (fromVoice) {
            speakText(errorMessage, currentLanguage);
        }
        return;
    }

    // Show typing indicator
    addTypingIndicator();

    try {
        // Prepare the request payload with clear language instructions
        const systemPrompt = currentLanguage === "ar" ?
            "أنت خبير في أمراض النباتات والزراعة. مهم جدًا: اكتب الرد باللغة العربية فقط! قدم معلومات مفيدة ودقيقة عن النباتات والأمراض النباتية." :
            "You are an expert in plant diseases and agriculture. Very important: Write your response in English only! Provide helpful and accurate information about plants and plant diseases.";
        
        console.log(`Using system prompt in ${currentLanguage}`);
        
        const payload = {
            contents: [
                {
                    role: "user",
                    parts: [{ text: `${systemPrompt} User question: ${userInput}` }],
                },
            ],
        };

        // Make a POST request to the Gemini API
        console.log("Sending request to Gemini API");
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
        console.log("Received response from Gemini API");

        // Extract the bot's response
        const botResponse = data.candidates[0].content.parts[0].text || 
            (currentLanguage === "ar" ? "لم أتمكن من إنشاء رد." : "I couldn't generate a response.");

        // Clean asterisks from Arabic responses
        const cleanedResponse = cleanAsteriskFormatting(botResponse);

        // Add the bot's response to the chat box
        addMessage(cleanedResponse, "bot", fromVoice);
    } catch (error) {
        console.error("Error communicating with Gemini API:", error);
        
        const errorMessage = currentLanguage === "ar" ?
            "عذرًا، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى لاحقًا." :
            "Sorry, an error occurred while processing your request. Please try again later.";
        
        // Remove typing indicator
        const chatBox = document.getElementById("chatBox");
        const typingIndicator = document.getElementById("typingIndicator");
        if (typingIndicator) {
            chatBox.removeChild(typingIndicator);
        }
        
        addMessage(errorMessage, "bot", fromVoice);
    }
}

// Function to toggle the chatbot's visibility with animation
function toggleChat() {
    const chatContainer = document.getElementById("chatContainer");
    const chatToggleBtn = document.getElementById("chatToggleBtn");
    
    if (chatContainer.classList.contains("chat-visible")) {
        chatContainer.classList.remove("chat-visible");
        chatContainer.classList.add("chat-hidden");
        chatToggleBtn.innerHTML = '<i class="fas fa-comments"></i>';
    } else {
        chatContainer.classList.remove("chat-hidden");
        chatContainer.classList.add("chat-visible");
        chatToggleBtn.innerHTML = '<i class="fas fa-times"></i>';
        document.getElementById("userInput").focus();
    }
}

// Handle enter key press in input field
function handleKeyPress(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
}

// Add CSS class for RTL text direction to document if language is Arabic
function updateDocumentDirection() {
    if (currentLanguage === "ar") {
        document.documentElement.classList.add("rtl");
        document.documentElement.dir = "rtl";
        document.getElementById("chatBox").style.direction = "rtl";
        document.getElementById("userInput").style.direction = "rtl";
    } else {
        document.documentElement.classList.remove("rtl");
        document.documentElement.dir = "ltr";
        document.getElementById("chatBox").style.direction = "ltr";
        document.getElementById("userInput").style.direction = "ltr";
    }
    
    // Update input placeholder
    const inputField = document.getElementById("userInput");
    if (inputField) {
        inputField.placeholder = currentLanguage === "ar" ? 
            "اكتب رسالتك هنا..." : "Type your message here...";
    }
}

// Initialize the chatbot when the DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
    console.log("Initializing chatbot...");
    
    // Check browser language setting
    const browserLang = navigator.language || navigator.userLanguage;
    currentLanguage = browserLang && browserLang.startsWith("ar") ? "ar" : "en";
    console.log(`Initial language set to: ${currentLanguage}`);
    
    // Load speech synthesis voices
    if (speechSynthesis) {
        // Some browsers need explicit loading of voices
        speechSynthesis.onvoiceschanged = () => {
            voices = speechSynthesis.getVoices();
            console.log("Available voices loaded:", voices.length);
        };
        // Try to load voices immediately as well
        voices = speechSynthesis.getVoices();
    }
    
    // Initialize speech recognition
    initSpeechRecognition();
    
    // Add event listeners
    document.getElementById("sendButton").addEventListener("click", () => sendMessage());
    document.getElementById("micButton").addEventListener("click", toggleListening);
    document.getElementById("chatToggleBtn").addEventListener("click", toggleChat);
    document.getElementById("userInput").addEventListener("keypress", handleKeyPress);
    
    // Set initial document direction
    updateDocumentDirection();

    // Add a welcome message in the appropriate language
    setTimeout(() => {
        const welcomeMessage = currentLanguage === "ar" ?
            "مرحبًا! أنا مساعدك لتشخيص أمراض النباتات. كيف يمكنني مساعدتك اليوم؟" :
            "Hello! I'm your plant disease diagnosis assistant. How can I help you today?";
        addMessage(welcomeMessage, "bot");
    }, 500);
    
    console.log("Chatbot initialization complete");
    
});
