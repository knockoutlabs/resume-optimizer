from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import docx2txt 
import pdfplumber
import os
import time

app = Flask(__name__)
CORS(app)  # Allow all origins

# Get the API key from environment variables (set it in Replit Secrets as OPENAI_API_KEY)
openai.api_key = os.getenv("OPENAI_API_KEY")


def extract_text_from_file(file_path):
    """Extract text from PDF or DOCX file"""
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
        # Validate file upload
        if 'resume' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        resume_file = request.files['resume']

        # Validate file extension
        allowed_extensions = ['.pdf', '.docx']
        file_ext = os.path.splitext(resume_file.filename)[1].lower()
        if file_ext not in allowed_extensions:
            return jsonify({
                "error":
                "Invalid file type. Please upload a PDF or DOCX file."
            }), 400

        # Get job description URL
        job_posting_url = request.form.get('job_description', '')
        if not job_posting_url:
            return jsonify({"error": "Job posting URL is required"}), 400

        # Create temp directory if it doesn't exist
        os.makedirs("temp", exist_ok=True)
        file_path = f"temp/{resume_file.filename}"
        resume_file.save(file_path)

        # Extract text from resume
        resume_text = extract_text_from_file(file_path)

        # Clean up the file after processing
        os.remove(file_path)

        # If resume text is empty, return error
        if not resume_text:
            return jsonify(
                {"error":
                 "Could not extract text from the uploaded file"}), 400

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
        # Add small delay to simulate longer processing time for better UX
        # Helps with the progress bar in the frontend
        time.sleep(1)

        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",  # Change to GPT-4 if you have access
            messages=[{
                "role": "user",
                "content": prompt
            }],
            temperature=0.0)
        recommendations = response.choices[0].message.content.strip()

        # Add a small delay before sending response
        time.sleep(0.5)

        return jsonify({'recommendations': recommendations})

    except Exception as e:
        print(f"🔥 ERROR: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    return jsonify({
        "status": "healthy",
        "message": "Resume Optimizer API is running"
    }), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
