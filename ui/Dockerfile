FROM python:3.10.12-slim

WORKDIR /app

# Copy the requirements.txt file to the /app directory in the container
COPY ../requirements/ui.txt requirements.txt

# Install the dependencies from requirements.txt
RUN pip install -r requirements.txt

# Copy the ui subfolder from the current directory on the host to the /app/ui directory in the container
COPY . .

# Set the command to run the Streamlit app
CMD ["streamlit", "run", "ui/Leaderboard.py", "--server.port=8501", "--theme.base=dark", "--global.developmentMode=false"]
