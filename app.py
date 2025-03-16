from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import docx2txt
import pdfplumber
import os

app = Flask(__name__)
CORS(app)  # Allow all origins

# Get the API key from environment variables (set it in Replit Secrets as OPENAI_API_KEY)
openai.api_key = os.getenv("OPENAI_API_KEY")


def extract_text_from_file(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    text = ""
    if ext == ".pdf":
        with pdfplumber.open(file_path) as pdf:
            text = "\n".join([
                page.extract_text() for page in pdf.pages
                if page.extract_text()
            ])
    elif ext == ".docx":
        text = docx2txt.process(file_path)
    return text


@app.route('/analyze', methods=['POST'])
def analyze_resume():
    try:
        if 'resume' not in request.files:
            raise ValueError("No file uploaded")

        resume_file = request.files['resume']
        job_posting_url = request.form.get('job_description', '')

        os.makedirs("temp", exist_ok=True)
        file_path = f"temp/{resume_file.filename}"
        resume_file.save(file_path)

        resume_text = extract_text_from_file(file_path)
        os.remove(file_path)

        prompt = f"""
You are an expert career advisor. Analyze the following resume and job posting URL, then provide a concise overall summary (under 40 words) of the assessment, followed by specific, actionable recommendations in exactly the following format (and also calculate their total work experience and see if it meets the job description requirement as you analyze and give your recommendation):

Overall Summary: <overall summary, under 40 words>

Key Missing Skills:
- <bullet point 1>
- <bullet point 2>
- <bullet point 3>

Keyword Optimization:
- <bullet point 1>
- <bullet point 2>
- <bullet point 3>

Suggested Improvements:
- <bullet point 1>
- <bullet point 2>
- <bullet point 3>

If a section has no recommendations, simply output "Everything looks great!" for that section.

Resume:
{resume_text}

Job Posting URL:
{job_posting_url}

Please output exactly in the above format.
"""
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",  # Change to GPT-4 if you have access
            messages=[{
                "role": "user",
                "content": prompt
            }],
            temperature=0.0)
        recommendations = response.choices[0].message.content.strip()
        return jsonify({'recommendations': recommendations})

    except Exception as e:
        print(f"🔥 ERROR: {str(e)}")
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
