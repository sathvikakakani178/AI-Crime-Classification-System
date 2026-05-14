from langdetect import detect, LangDetectException
from deep_translator import GoogleTranslator

LANGUAGE_NAMES = {
    "en": "English", "hi": "Hindi", "te": "Telugu", "ta": "Tamil",
    "kn": "Kannada", "ml": "Malayalam", "mr": "Marathi", "bn": "Bengali",
    "gu": "Gujarati", "pa": "Punjabi", "ur": "Urdu", "or": "Odia",
    "as": "Assamese", "fr": "French", "de": "German", "es": "Spanish",
    "ar": "Arabic", "zh-cn": "Chinese", "ja": "Japanese", "ko": "Korean",
    "pt": "Portuguese", "ru": "Russian", "it": "Italian",
}

def detect_and_translate(text: str) -> dict:
    """
    Detects the language of the input text and translates to English if needed.
    Returns a dict with: detected_language, was_translated, translated_text
    """
    try:
        detected_code = detect(text)
    except LangDetectException:
        detected_code = "en"

    detected_name = LANGUAGE_NAMES.get(detected_code, detected_code.upper())

    if detected_code == "en":
        return {
            "detected_language": detected_name,
            "was_translated": False,
            "translated_text": text,
        }

    # Translate to English
    try:
        translated = GoogleTranslator(source="auto", target="en").translate(text)
        return {
            "detected_language": detected_name,
            "was_translated": True,
            "translated_text": translated,
        }
    except Exception as e:
        print(f"[Translator] Translation failed: {e}. Using original text.")
        return {
            "detected_language": detected_name,
            "was_translated": False,
            "translated_text": text,
        }
