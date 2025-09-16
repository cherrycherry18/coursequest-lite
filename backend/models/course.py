from db import db

class Course(db.Model):
    __tablename__ = 'courses'

    course_id = db.Column(db.String(50), primary_key=True)
    course_name = db.Column(db.String(255), nullable=False)
    department = db.Column(db.String(100), nullable=False, index=True)
    level = db.Column(db.Enum('UG', 'PG', name='level_enum'), nullable=False, index=True)
    delivery_mode = db.Column(db.Enum('online', 'offline', 'hybrid', name='delivery_enum'), nullable=False, index=True)
    credits = db.Column(db.Integer, nullable=False)
    duration_weeks = db.Column(db.Integer, nullable=False)
    rating = db.Column(db.Float, nullable=False)
    tuition_fee_inr = db.Column(db.Integer, nullable=False, index=True)
    year_offered = db.Column(db.Integer, nullable=False, index=True)

    def to_dict(self):
        return {
            'course_id': self.course_id,
            'course_name': self.course_name,
            'department': self.department,
            'level': self.level,
            'delivery_mode': self.delivery_mode,
            'credits': self.credits,
            'duration_weeks': self.duration_weeks,
            'rating': self.rating,
            'tuition_fee_inr': self.tuition_fee_inr,
            'year_offered': self.year_offered,
        }