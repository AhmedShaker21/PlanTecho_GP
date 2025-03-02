🌿 PlanTecho - Smart Agriculture System

📌 Project Overview

PlanTecho is an IoT-powered smart agriculture system that integrates AI, embedded systems, and cloud computing to optimize farming. The system collects real-time environmental data, analyzes it, and provides insights to improve crop health and efficiency.

✨ Features

Real-Time Data Collection 📡: Monitors soil moisture, temperature, and humidity.

Automated Irrigation 💧: AI-based decision-making for water management.

Fire Detection System 🔥: Detects early signs of fire and sends alerts.

Web-Based Dashboard 📊: Displays analytics and recommendations.

Wireless Connectivity 🌍: Uses ESP32 FireBeetle for remote monitoring.

🔧 Technologies Used

Hardware: ESP32 FireBeetle, DHT11 Sensor

Backend: .NET 8 (WebSocket Server, REST API, gRPC API, SOAP API)

Frontend: React.js, Chart.js

Database: PostgreSQL

Cloud Services: Azure IoT Hub (Optional)

Communication Protocols: WebSockets, MQTT

🛠️ Installation Guide

Clone the Repository:

git clone https://github.com/AhmedShaker21/PlanTecho_GP.git
cd PlanTecho_GP

Backend Setup:

Navigate to SensorAPI and run:

dotnet run

Ensure WebSocket and REST services are running.

Frontend Setup:

Navigate to Dashboard folder:

npm install
npm start

Database Setup:

Configure PostgreSQL connection in .env file.

Run migrations:

dotnet ef database update

Deploy & Run: 🚀

Ensure ESP32 is connected.

Access the web dashboard at http://localhost:3000.

📢 How to Use

Register your farm 🏡 on the dashboard.

Connect sensors 🔗 using the IoT module.

Monitor real-time data 📊 and receive alerts.

Adjust irrigation settings 🌱 for optimal farming.

👨‍💻 Contributors

Ahmed Shaker - Team Leader
Ziad Ibrahim
Amira Hatem
Rana Nasser
Shahd Mohamed


🚀 Empowering Agriculture with Smart Technology!
