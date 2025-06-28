import os
import base64
import tempfile
import speech_recognition as sr
import pyttsx3
from langdetect import detect
import google.generativeai as genai
from flask import Flask, request, jsonify, render_template
from gtts import gTTS

# === Gemini API Config ===
import os
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("models/gemini-2.0-flash")
print("[INFO] Gemini API configured with model 'gemini-2.0-flash'")

# === Flask App Init ===
app = Flask(__name__)

# === TTS Engine Setup ===
def setup_tts():
    engine = pyttsx3.init()
    voices = engine.getProperty('voices')
    arabic_voices = [v for v in voices if 'arabic' in v.name.lower() or 'ar-' in v.id.lower()]
    if arabic_voices:
        engine.setProperty('voice', arabic_voices[0].id)
    return engine

tts_engine = setup_tts()

# === Audio to Text (STT) ===
def process_audio(audio_data: bytes) -> str | None:
    recognizer = sr.Recognizer()
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp:
        tmp.write(audio_data)
        tmp_path = tmp.name
    try:
        with sr.AudioFile(tmp_path) as source:
            audio = recognizer.record(source)
            try:
                return recognizer.recognize_google(audio, language="ar-EG")
            except sr.UnknownValueError:
                return "الصوت غير واضح، حاول مرة أخرى."
            except:
                return recognizer.recognize_google(audio, language="en-US")
    except Exception as e:
        print(f"Speech recognition error: {e}")
        return "حدث خطأ أثناء معالجة الصوت."
    finally:
        os.remove(tmp_path)

# === Gemini Plant Expert Response ===
def generate_response(text: str) -> dict:
    if not text:
        return {'text': "لا يمكنني الحصول على المعلومات الآن", 'error': True}
    try:
        lang = detect(text)
    except:
        lang = 'ar'

    prompt = (
        "You are a plant expert. Answer concisely in the same language as the question. "
        "If not plant-related, say 'أسئلة النباتات فقط' in Arabic or 'Plant questions only' in English.\n\n"
        f"Question: {text}"
    )

    try:
        response = model.generate_content(prompt)
        if not response or not hasattr(response, 'text'):
            return {'text': "حدث خطأ في النظام. يرجى المحاولة لاحقاً", 'error': True}
        return {'text': response.text, 'error': False}
    except Exception as e:
        print(f"Gemini Error: {e}")
        return {'text': "خدمة الخبراء غير متوفرة حالياً", 'error': True}

# === Text to Speech (TTS) ===
def text_to_speech(text: str) -> str | None:
    if not text:
        return None
    try:
        lang = detect(text)
    except:
        lang = "en"
    
    if lang == "ar":
        arabic_voices = [v for v in tts_engine.getProperty('voices') 
                         if 'arabic' in v.name.lower() or 'ar-' in v.id.lower()]
        if arabic_voices:
            tts_engine.setProperty('voice', arabic_voices[0].id)
    
    with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as tmp:
        tmp_path = tmp.name

    tts_engine.save_to_file(text, tmp_path)
    tts_engine.runAndWait()

    with open(tmp_path, 'rb') as f:
        audio_data = f.read()
    
    os.unlink(tmp_path)
    return base64.b64encode(audio_data).decode('utf-8')

# === Flask Routes ===
@app.route('/')
def home():
    return render_template("index.html")

@app.route('/chat', methods=["POST"])
def chat():
    data = request.json or {}
    user_text = data.get("message")
    audio_b64 = data.get("audio")

    # Convert audio to text
    if audio_b64:
        try:
            if ',' in audio_b64:
                audio_data = base64.b64decode(audio_b64.split(',', 1)[1])
            else:
                audio_data = base64.b64decode(audio_b64)
            detected_text = process_audio(audio_data)
            if detected_text:
                user_text = detected_text
        except Exception as e:
            print(f"Audio processing error: {e}")

    # Get response
    response_data = generate_response(user_text)
    response_text = response_data['text']

    # Generate speech
    audio_response = None
    if not response_data['error']:
        audio_b64_resp = text_to_speech(response_text)
        if audio_b64_resp:
            audio_response = f"data:audio/mp3;base64,{audio_b64_resp}"

    return jsonify({
        'user_message': user_text,
        'response': response_text,
        'error': response_data['error'],
        'audio': audio_response,
        'user_audio': audio_b64 if audio_b64 else None
    })

# === Run Flask App ===
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
