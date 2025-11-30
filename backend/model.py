from config import db
from werkzeug.security import generate_password_hash, check_password_hash

class UserModel(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), unique=False, nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    phone = db.Column(db.String(100), unique=False, nullable=False)
    password = db.Column(db.String(256), unique=False, nullable=False)
    orders = db.relationship('OrderModel', back_populates='user', lazy='dynamic')
    role = db.Column(db.String(10), unique=False, nullable=False, default='Customer')  # Fixed here

    def set_password(self, password):
        self.password = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password, password)
    
    def json(self):
        return {"name": self.name,
                "email": self.email,
                "phone": self.phone
        }

class AdminModel(db.Model):
    __tablename__ = 'admins'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), unique=False, nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    phone = db.Column(db.String(100), unique=False, nullable=False)
    password = db.Column(db.String(256), unique=False, nullable=False)
    role = db.Column(db.String(10), unique=False, nullable=False, default='Admin')  # Fixed here

    def set_password(self, password):
        self.password = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password, password)

    def json(self):
        return {"name": self.name,
                "email": self.email,
                "phone": self.phone
        }

class CourierModel(db.Model):
    __tablename__ = 'couriers'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), unique=False, nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    password = db.Column(db.String(256), unique=False, nullable=False)
    phone = db.Column(db.String(100), unique=False, nullable=False)
    orders = db.relationship('OrderModel', back_populates='courier', lazy='dynamic')
    role = db.Column(db.String(10), unique=False, nullable=False, default='Courier')  # Fixed here
    
    def set_password(self, password):
        self.password = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password, password)
    
    def json(self):
        return {"name": self.name,
                "email": self.email,
                'role': 'courier',
                "list_of_orders": [order.json() for order in self.orders]

        }

class OrderModel(db.Model):
    __tablename__ = 'orders'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    status = db.Column(db.String(100), nullable=False)
    pickup_location = db.Column(db.String(100), nullable=True)
    dropoff_location = db.Column(db.String(100), nullable=True)
    package_details = db.Column(db.String(100), nullable=True)
    courier_id = db.Column(db.Integer, db.ForeignKey('couriers.id'), index=True)
    courier = db.relationship('CourierModel', back_populates='orders')
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), index=True)
    user = db.relationship('UserModel', back_populates='orders')
    
    def json(self):
        return {"id": self.id,
                "status": self.status,
                "user_id": self.user_id,
                "courier_id": self.courier_id,
                "pickup_location": self.pickup_location,
                "dropoff_location": self.dropoff_location,
                "package_details": self.package_details
        }
