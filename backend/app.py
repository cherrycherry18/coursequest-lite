from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from routes.courses import courses_bp
from routes.compare import compare_bp
from routes.ingest import ingest_bp
from routes.ask import ask_bp
from db import init_db
import os

def create_app() -> Flask:
    load_dotenv()
    app = Flask(__name__)
    CORS(app)

    # Database
    init_db(app)

    # Health check
    @app.get('/api/health')
    def health():
        return {'status': 'ok'}

    # Register blueprints
    app.register_blueprint(courses_bp, url_prefix='/api/courses')
    app.register_blueprint(compare_bp, url_prefix='/api/compare')
    app.register_blueprint(ingest_bp, url_prefix='/api/ingest')
    app.register_blueprint(ask_bp, url_prefix='/api/ask')

    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.getenv('PORT', '5000'))
    app.run(host='0.0.0.0', port=port, debug=True)
