from flask import Blueprint, request
from models.course import Course
from sqlalchemy import asc
import re

ask_bp = Blueprint('ask', __name__)

def parse_question(q: str):
    text = q.lower()
    filters = {}

    # Level detection
    if 'pg' in text or 'postgraduate' in text or 'masters' in text:
        filters['level'] = 'PG'
    if 'ug' in text or 'undergraduate' in text or 'bachelors' in text:
        filters['level'] = 'UG'

    # Delivery mode detection
    if 'online' in text:
        filters['delivery_mode'] = 'online'
    elif 'offline' in text or 'on-campus' in text or 'on campus' in text:
        filters['delivery_mode'] = 'offline'
    elif 'hybrid' in text:
        filters['delivery_mode'] = 'hybrid'

    # Fee detection
    fee_match = re.search(r"under\s*(\d[\d,]*)|below\s*(\d[\d,]*)", text)
    fee_value = fee_match.group(1) if fee_match else None
    if not fee_value and fee_match:
        fee_value = fee_match.group(2)
    if fee_value:
        filters['max_fee'] = int(fee_value.replace(',', ''))

    # Rating detection
    rating_match = re.search(r"rating\s*(\d(\.\d)?)", text)
    if rating_match:
        filters['min_rating'] = float(rating_match.group(1))

    # Department detection
    depts = ['computer science','cs','mechanical','electrical','civil','mathematics','physics','chemistry','biology','economics','business','commerce','management','data science','ai','artificial intelligence']
    for d in depts:
        if d in text:
            filters['department'] = 'computer science' if d == 'cs' else d
            break

    return filters

@ask_bp.post('/')
def ask():
    data = request.get_json(silent=True) or {}
    question = data.get('question')
    if not question or len(question) < 3:
        return {'error': 'Invalid question'}, 400

    f = parse_question(question)

    query = Course.query
    if f.get('department'):
        query = query.filter(Course.department.ilike(f.get('department')))
    if f.get('level'):
        query = query.filter(Course.level == f.get('level'))
    if f.get('delivery_mode'):
        query = query.filter(Course.delivery_mode == f.get('delivery_mode'))
    if f.get('max_fee') is not None:
        query = query.filter(Course.tuition_fee_inr <= f.get('max_fee'))
    if f.get('min_rating') is not None:
        query = query.filter(Course.rating >= f.get('min_rating'))

    items = query.order_by(asc(Course.course_name)).limit(20).all()
    return {
        'filters': f,
        'items': [c.to_dict() for c in items],
        'message': None if items else 'No matching courses found'
    }