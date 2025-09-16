from flask import Blueprint, request
from sqlalchemy import or_, asc
from models.course import Course

courses_bp = Blueprint('courses', __name__)

@courses_bp.get('/')
def list_courses():
    q = request.args
    search = q.get('search')
    department = q.get('department')
    level = q.get('level')
    delivery_mode = q.get('delivery_mode')
    min_credits = q.get('min_credits', type=int)
    max_credits = q.get('max_credits', type=int)
    max_fee = q.get('max_fee', type=int)
    min_rating = q.get('min_rating', type=float)
    year_offered = q.get('year_offered', type=int)
    page = max(q.get('page', default=1, type=int), 1)
    page_size = min(max(q.get('page_size', default=10, type=int), 1), 100)

    query = Course.query
    if search:
        like = f"%{search}%"
        query = query.filter(or_(Course.course_name.ilike(like), Course.department.ilike(like)))
    if department:
        query = query.filter(Course.department.ilike(department))
    if level in ('UG', 'PG'):
        query = query.filter(Course.level == level)
    if delivery_mode in ('online', 'offline', 'hybrid'):
        query = query.filter(Course.delivery_mode == delivery_mode)
    if min_credits is not None:
        query = query.filter(Course.credits >= min_credits)
    if max_credits is not None:
        query = query.filter(Course.credits <= max_credits)
    if max_fee is not None:
        query = query.filter(Course.tuition_fee_inr <= max_fee)
    if min_rating is not None:
        query = query.filter(Course.rating >= min_rating)
    if year_offered is not None:
        query = query.filter(Course.year_offered == year_offered)

    total = query.count()
    items = (
        query.order_by(asc(Course.course_name))
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return {
        'items': [c.to_dict() for c in items],
        'total': total,
        'page': page,
        'page_size': page_size,
    }