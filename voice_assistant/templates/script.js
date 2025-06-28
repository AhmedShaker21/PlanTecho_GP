// const chatBox = document.getElementById("chat-box");
//         const userInput = document.getElementById("user-input");
//         const sendButton = document.getElementById("send-button");
//         const recordButton = document.getElementById("record-button");

//         let mediaRecorder;
//         let audioChunks = [];
//         let isRecording = false;

//         // Handle text input
//         sendButton.addEventListener("click", sendTextMessage);
//         userInput.addEventListener("keypress", (e) => {
//             if (e.key === "Enter") sendTextMessage();
//         });

//         // Handle voice input
//         recordButton.addEventListener("click", toggleRecording);

//         async function toggleRecording() {
//             if (!isRecording) {
//                 await startRecording();
//             } else {
//                 stopRecording();
//             }
//         }

//         async function startRecording() {
//             try {
//                 const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//                 mediaRecorder = new MediaRecorder(stream);
//                 audioChunks = [];

//                 mediaRecorder.ondataavailable = event => {
//                     audioChunks.push(event.data);
//                 };

//                 mediaRecorder.onstop = async () => {
//                     const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
//                     sendVoiceMessage(audioBlob);
//                 };

//                 mediaRecorder.start();
//                 isRecording = true;
//                 recordButton.innerHTML = '<span class="material-icons">stop</span>';
//                 userInput.placeholder = "Listening... Speak now";

//             } catch (error) {
//                 showError("Microphone access denied");
//                 console.error("Recording error:", error);
//             }
//         }

//         function stopRecording() {
//             mediaRecorder.stop();
//             isRecording = false;
//             recordButton.innerHTML = '<span class="material-icons">mic</span>';
//             userInput.placeholder = "Type or speak your plant question...";
//         }

//         function sendTextMessage() {
//             const message = userInput.value.trim();
//             if (!message) return;

//             addMessage(message, "user");
//             userInput.value = "";

//             sendToBackend(message);
//         }

//         async function sendVoiceMessage(audioBlob) {
//             addAudioMessage(audioBlob);

//             try {
//                 const audioBase64 = await blobToBase64(audioBlob);
//                 sendToBackend(null, audioBase64);
//             } catch (error) {
//                 showError("Failed to process audio");
//                 console.error("Audio processing error:", error);
//             }
//         }
//         function sendToBackend(text, audioBase64 = null) {
//             showLoading(true);

//             const data = {
//                 message: text,
//                 audio: audioBase64
//             };

//             fetch('/chat', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify(data)
//             })
//                 .then(response => {
//                     if (!response.ok) {
//                         throw new Error('Network response was not ok');
//                     }
//                     return response.json();
//                 })
//                 .then(data => {
//                     showLoading(false);

//                     if (data.error) {
//                         showError(data.response);
//                     } else {
//                         addMessage(data.response, "bot");
//                         if (data.audio) {
//                             addAudioResponse(data.audio);
//                         }
//                     }
//                 })
//                 .catch(error => {
//                     showLoading(false);
//                     showError("Connection error");
//                     console.error("API error:", error);
//                 });
//         }

//         function showError(message) {
//             const errorDiv = document.createElement("div");
//             errorDiv.classList.add("error-message");

//             // Add error icon
//             errorDiv.innerHTML = `
//         <span class="material-icons" style="vertical-align: middle; margin-right: 5px;">error</span>
//         ${message}
//     `;

//             // Remove previous errors first
//             document.querySelectorAll('.error-message').forEach(el => el.remove());

//             chatBox.appendChild(errorDiv);
//             chatBox.scrollTop = chatBox.scrollHeight;

//             // Auto-remove after 5 seconds
//             setTimeout(() => {
//                 errorDiv.remove();
//             }, 5000);
//         }

//         function showLoading(show) {
//             const existingLoader = document.getElementById('loading-indicator');
//             if (existingLoader) existingLoader.remove();

//             if (show) {
//                 const loader = document.createElement("div");
//                 loader.id = "loading-indicator";
//                 loader.classList.add("chat-message", "bot-message");
//                 loader.innerHTML = `
//             <div style="display: flex; align-items: center;">
//                 <div class="loader"></div>
//                 <span style="margin-left: 10px;">جارٍ المعالجة...</span>
//             </div>
//         `;
//                 chatBox.appendChild(loader);
//                 chatBox.scrollTop = chatBox.scrollHeight;
//             }
//         }


//         function addMessage(text, sender) {
//             const messageDiv = document.createElement("div");
//             messageDiv.classList.add("chat-message", `${sender}-message`);
//             messageDiv.textContent = text;
//             chatBox.appendChild(messageDiv);
//             chatBox.scrollTop = chatBox.scrollHeight;
//         }

//         function addAudioMessage(audioBlob) {
//             const audioUrl = URL.createObjectURL(audioBlob);
//             const messageDiv = document.createElement("div");
//             messageDiv.classList.add("chat-message", "user-message");
//             messageDiv.innerHTML = `
//                  <audio controls>
//                      <source src="${audioUrl}" type="audio/wav">
//                  </audio>
//              `;
//             chatBox.appendChild(messageDiv);
//             chatBox.scrollTop = chatBox.scrollHeight;
//         }

//         function addAudioResponse(audioBase64) {
//             const messageDiv = document.createElement("div");
//             messageDiv.classList.add("chat-message", "bot-message");
//             messageDiv.innerHTML = `
//                  <audio controls autoplay>
//                      <source src="${audioBase64}" type="audio/mp3">
//                  </audio>
//              `;
//             chatBox.appendChild(messageDiv);
//             chatBox.scrollTop = chatBox.scrollHeight;
//         }

//         function showError(message) {
//             const errorDiv = document.createElement("div");
//             errorDiv.classList.add("error-message");
//             errorDiv.textContent = message;
//             chatBox.appendChild(errorDiv);
//             chatBox.scrollTop = chatBox.scrollHeight;
//         }

//         async function blobToBase64(blob) {
//             return new Promise((resolve, reject) => {
//                 const reader = new FileReader();
//                 reader.onloadend = () => {
//                     const base64data = reader.result.split(',')[1];
//                     resolve(base64data);
//                 };
//                 reader.onerror = reject;
//                 reader.readAsDataURL(blob);
//             });
//         }




















const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const recordButton = document.getElementById("record-button");

let mediaRecorder;
let audioChunks = [];
let isRecording = false;

// Handle text input
sendButton.addEventListener("click", sendTextMessage);
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendTextMessage();
});

// Handle voice input
recordButton.addEventListener("click", toggleRecording);

async function toggleRecording() {
    if (!isRecording) {
        await startRecording();
    } else {
        stopRecording();
    }
}

async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
            sendVoiceMessage(audioBlob);
        };

        mediaRecorder.start();
        isRecording = true;
        recordButton.innerHTML = '<span class="material-icons">stop</span>';
        userInput.placeholder = "Listening... Speak now";

    } catch (error) {
        showError("Microphone access denied");
        console.error("Recording error:", error);
    }
}

function stopRecording() {
    mediaRecorder.stop();
    isRecording = false;
    recordButton.innerHTML = '<span class="material-icons">mic</span>';
    userInput.placeholder = "Type or speak your plant question...";
}

function sendTextMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    addMessage(message, "user");
    userInput.value = "";

    sendToBackend(message);
}

async function sendVoiceMessage(audioBlob) {
    addAudioMessage(audioBlob);

    try {
        const audioBase64 = await blobToBase64(audioBlob);
        sendToBackend(null, audioBase64);
    } catch (error) {
        showError("Failed to process audio");
        console.error("Audio processing error:", error);
    }
}

function sendToBackend(text, audioBase64 = null) {
    showLoading(true);

    const data = {
        message: text,
        audio: audioBase64
    };

    fetch('/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            showLoading(false);

            if (data.error) {
                showError(data.response);
            } else {
                addMessage(data.response, "bot");
                if (data.audio) {
                    addAudioResponse(data.audio);
                }
            }
        })
        .catch(error => {
            showLoading(false);
            showError("Connection error");
            console.error("API error:", error);
        });
}

function showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.classList.add("error-message");

    // Add error icon
    errorDiv.innerHTML = `
        <span class="material-icons" style="vertical-align: middle; margin-right: 5px;">error</span>
        ${message}
    `;

    // Remove previous errors first
    document.querySelectorAll('.error-message').forEach(el => el.remove());

    chatBox.appendChild(errorDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    // Auto-remove after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

function showLoading(show) {
    const existingLoader = document.getElementById('loading-indicator');
    if (existingLoader) existingLoader.remove();

    if (show) {
        const loader = document.createElement("div");
        loader.id = "loading-indicator";
        loader.classList.add("chat-message", "bot-message");
        loader.innerHTML = `
            <div style="display: flex; align-items: center;">
                <div class="loader"></div>
                <span style="margin-left: 10px;">جارٍ المعالجة...</span>
            </div>
        `;
        chatBox.appendChild(loader);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

function addMessage(text, sender) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("chat-message", `${sender}-message`);
    messageDiv.textContent = text;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function addAudioMessage(audioBlob) {
    const audioUrl = URL.createObjectURL(audioBlob);
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("chat-message", "user-message");
    messageDiv.innerHTML = `
        <audio controls>
            <source src="${audioUrl}" type="audio/wav">
        </audio>
    `;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function addAudioResponse(audioBase64) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("chat-message", "bot-message");
    messageDiv.innerHTML = `
        <audio controls autoplay>
            <source src="${audioBase64}" type="audio/mp3">
        </audio>
    `;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64data = reader.result.split(',')[1];
            resolve(base64data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}
