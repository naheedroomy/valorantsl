# Use an official Python runtime as a parent image
FROM python:3.10.12-slim

# Set the working directory in the container
WORKDIR /app

# Copy requirements file into the container
COPY requirements.txt requirements.txt

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Create log folder
RUN mkdir /app/log

# Copy the entire application code into the container (from the root, not just backend)
COPY . .

# Expose port 8000
EXPOSE 8000

# Run the application (ensure the correct path to main.py)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
