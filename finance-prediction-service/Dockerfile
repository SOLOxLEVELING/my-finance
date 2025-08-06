# Use an official, slim Python image
FROM python:3.9-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file first for build caching
COPY requirements.txt .

# Install the Python libraries
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your application's code
COPY . .

# Tell Docker that this service runs on port 5001
EXPOSE 5001

# The command to run the Python service when the container starts
CMD [ "python", "-u", "prediction_service.py" ]