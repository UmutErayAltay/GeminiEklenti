from flask import Flask, request, send_file
from PIL import Image
import io
import base64
import google.generativeai as genai
from gtts import gTTS

# Or use `os.getenv('GOOGLE_API_KEY')` to fetch an environment variable.
GOOGLE_API_KEY="AIzaSyDX7gQa6aXdDrIkejIz4IwR1d_H3ZMpnrM"

genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-pro-vision')
app = Flask(__name__)

@app.route('/receive_screenshot', methods=['POST'])
def receive_screenshot():
    screenshot_data = request.form['screenshot']
    image_data = screenshot_data.split(",")[1]
    # Base64 kodunu PIL ile aç
    image = Image.open(io.BytesIO(base64.b64decode(image_data)))
    response = model.generate_content(["Bu whatsapp konuşmasında gönderilen son resmin yorumunu yap sadece. Sohbetten ya da başka bir şeyden bahsetme. Gönderilmiş olan resimden",image])
    # Resmi işle
    # Örnek: Resmi kaydetmek
    image.save("received_screenshot.png")
    tts = gTTS(text=response.text, lang='tr')  # Türkçe dilini kullanıyoruz
    audio_file = "output.mp3"  # Ses dosyasının adı ve uzantısı
    tts.save(audio_file)
    return send_file(tts, mimetype='audio/mp3')
if __name__ == '__main__':
    app.run(debug=True)
