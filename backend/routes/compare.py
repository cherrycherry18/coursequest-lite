from flask import Blueprint, request
from models.course import Course

compare_bp = Blueprint('compare', __name__)

@compare_bp.get('/')
def compare():
    ids = request.args.get('ids')
    if not ids:
        return {'error': 'ids query param required e.g. ids=CS101,CS102'}, 400
    
    id_list = [s.strip() for s in ids.split(',') if s.strip()]
    items = Course.query.filter(Course.course_id.in_(id_list)).all()
    return {'items': [c.to_dict() for c in items]}