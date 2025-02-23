# LendSureAI

A modern credit risk analysis tool built with React, Django, and Supabase. This application helps analyze credit risk using AI to process unstructured customer data and provide detailed risk assessments.

## Features

- User authentication with Supabase
- Credit risk analysis using AI
- Detailed analysis reports
- History tracking of analyses
- PDF report generation
- Modern, responsive UI

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Chart.js
- Supabase Client
- PDF Generation

### Backend
- Django
- Django REST Framework
- Supabase Python Client
- Groq API Integration

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or later)
- Python (v3.9 or later)
- pip (Python package manager)
- npm (Node package manager)

## Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/LendSureAI.git
cd LendSureAI
```

2. Set up the backend:
```bash
cd server
python -m venv venv
source venv/bin/activate  # On Windows use: .\venv\Scripts\activate
pip install -r requirements.txt
```

3. Create a `.env` file in the server directory:
```env
DEBUG=True
SECRET_KEY=your-django-secret-key
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
GROQ_API_KEY=your-groq-api-key
```

4. Set up the frontend:
```bash
cd ../client
npm install
```

5. Create a `.env` file in the client directory:
```env
REACT_APP_SUPABASE_URL=your-supabase-url
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Running the Application

1. Start the backend server:
```bash
cd server
python manage.py migrate  # Run database migrations
python manage.py runserver
```

2. Start the frontend development server:
```bash
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## API Endpoints

- `POST /api/analyses/`: Create a new analysis
- `GET /api/analyses/`: List all analyses
- `GET /api/analyses/{id}/`: Get specific analysis
- `GET /api/analyses/{id}/report/`: Get analysis report

## Testing

To run the test suite:

Backend tests:
```bash
cd server
python manage.py test
```

Frontend tests:
```bash
cd client
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@lendsureai.com or open an issue in the repository.