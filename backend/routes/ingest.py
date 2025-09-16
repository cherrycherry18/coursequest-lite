from flask import Blueprint, request
from werkzeug.utils import secure_filename
from models.course import Course
from db import db
import csv
import io
import os

ingest_bp = Blueprint('ingest', __name__)

@ingest_bp.post('/')
def ingest():
    token = request.headers.get('x-ingest-token')
    if not token or token != os.getenv('INGEST_TOKEN'):
        return {'error': 'Unauthorized'}, 401

    if 'file' not in request.files:
        return {'error': 'CSV file required in field "file"'}, 400

    f = request.files['file']
    filename = secure_filename(f.filename)
    if not filename.lower().endswith('.csv'):
        return {'error': 'Only CSV files are accepted'}, 400

    content = f.read().decode('utf-8')
    reader = csv.DictReader(io.StringIO(content))

    required = ['course_id','course_name','department','level','delivery_mode','credits','duration_weeks','rating','tuition_fee_inr','year_offered']
    for col in required:
        if col not in reader.fieldnames:
            return {'error': f'Missing column {col}'}, 400

    count = 0
    for row in reader:
        try:
            course = Course(
                course_id=row['course_id'].strip(),
                course_name=row['course_name'].strip(),
                department=row['department'].strip(),
                level=row['level'].strip(),
                delivery_mode=row['delivery_mode'].strip(),
                credits=int(row['credits']),
                duration_weeks=int(row['duration_weeks']),
                rating=float(row['rating']),
                tuition_fee_inr=int(row['tuition_fee_inr']),
                year_offered=int(row['year_offered']),
            )
        except Exception as e:
            return {'error': 'Invalid row', 'details': str(e), 'row': row}, 400

        existing = Course.query.get(course.course_id)
        if existing:
            # Update existing
            for k, v in course.to_dict().items():
                setattr(existing, k, v)
        else:
            db.session.add(course)
        count += 1

    db.session.commit()
    return {'inserted': count}