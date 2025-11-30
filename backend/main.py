import os
from flask import request, jsonify, current_app
from config import app, db
from model import UserModel , AdminModel, CourierModel, OrderModel

#======================================================================================================================#
#=========Signup/Login==================#

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    required_fields = ['name', 'email', 'phone', 'password', 'role']
    if not data or not all(key in data for key in required_fields):
        return jsonify({'message': 'Invalid request'}), 400

    existing_user = UserModel.query.filter_by(email=data['email']).first() or \
                    CourierModel.query.filter_by(email=data['email']).first() or \
                    AdminModel.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({'message': 'User already exists'}), 400

    def create_user(role, model):
        new_user = model(name=data['name'], email=data['email'], phone=data['phone'], role=role)
        new_user.set_password(data['password'])
        return new_user

    role = data['role'].strip().lower()
    if role == 'customer':
        new_user = create_user(role, UserModel)
    elif role == 'courier':
        new_user = create_user(role, CourierModel)
    elif role == 'admin':
        new_user = create_user(role, AdminModel)
    else:
        return jsonify({'message': 'Invalid role'}), 400

    try:
        db.session.add(new_user)
        db.session.commit()
    except Exception as e:
        return jsonify({'message': str(e)}), 400

    return jsonify(new_user.json()), 201


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not all(key in data for key in ['email', 'password']):
        return jsonify({'message': 'Invalid request'}), 400

    # Attempt to find the user by email
    user = UserModel.query.filter_by(email=data['email']).first()
    courier = CourierModel.query.filter_by(email=data['email']).first()
    admin = AdminModel.query.filter_by(email=data['email']).first()

    if user and user.check_password(data['password']):
        return jsonify({'message': 'Logged in successfully', 'role': 'user', 'userId': user.id}), 200 
    elif courier and courier.check_password(data['password']):
        return jsonify({'message': 'Logged in successfully', 'role': 'courier', 'userId': courier.id}), 200
    elif admin and admin.check_password(data['password']):
        return jsonify({'message': 'Logged in successfully', 'role': 'admin', 'userId': admin.id}), 200 
    else:
        return jsonify({'message': 'Incorrect email or password, please try again'}), 404

#======================================================================================================================#
#=========Orders==================#

@app.route('/orders/create', methods=['POST'])
def create_order():
    data = request.get_json()
    if not data or not all(key in data for key in ['user_id', 'pickup_location', 'dropoff_location','package_details']):
        return jsonify({'message': 'Invalid request'}), 400
    user = db.session.get(UserModel,data['user_id'])
    if not user:
        return jsonify({'message': 'User not found'}), 404
    new_order = OrderModel(pickup_location=data['pickup_location'], dropoff_location=data['dropoff_location'], user_id=data['user_id'],status='pending',package_details=data['package_details'])
    try:
        db.session.add(new_order)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 400
    return jsonify(new_order.json()), 200

@app.route('/users/order', methods=['GET'])
def get_user_orders():
    user_id = request.args.get('user_id')  
    if not user_id:
        return jsonify({'message': 'User ID is required'}), 400

    user = db.session.get(UserModel, user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    orders = OrderModel.query.filter_by(user_id=user_id).all()
    return jsonify([order.json() for order in orders]), 200


@app.route('/users/order', methods=['GET'])
def get_order():
    data = request.get_json() 
    user_id = data.get('user_id')
    order_id = request.args.get('order_id',type=int)
    if not user_id or not order_id:
        return jsonify({'message': 'User ID and Order ID are required'}), 400

    user = db.session.get(UserModel, user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    order = db.session.get(OrderModel, order_id)
    if not order:
        return jsonify({'message': 'Order not found'}), 404
    return jsonify(order.json()), 200
#///////////////////////////////////////////////////////////////////////////////
# Admin features

#Reterive all orders
@app.route('/admin/AllOrders', methods=['GET'])
def get_all_orders():
    orders = OrderModel.query.all()
    return jsonify([order.json() for order in orders]), 200

# Delete Order
@app.route('/admin/delete/order', methods=['DELETE'])
def delete_order():
    order_id = request.args.get('order_id',type=int)
    if not order_id:
        return jsonify({'message': 'Bad Request \n Please enter the order id you want to delete'}), 400
    order = db.session.get(OrderModel, order_id)
    if  not order:
        return jsonify({'message': 'Order ID not found'}), 404
    db.session.delete(order) 
    db.session.commit()
    return jsonify({'message': 'Order is deleted'}), 200

@app.route('/couriers', methods=['GET'])
def get_couriers():
    courier_id = request.args.get('courier_id', type=int)  # Optional filter by courier ID
    
    if courier_id:
        courier = CourierModel.query.get(courier_id)
        if not courier:
            return jsonify({'message': 'Courier not found'}), 404
        return jsonify(courier.json()), 200

    couriers = CourierModel.query.all()
    return jsonify([courier.json() for courier in couriers]), 200

# Cancel Order if it's still pending
@app.route('/cancelOrder', methods=['PUT'])
def cancel_order():
    order_id = request.args.get('order_id', type=int)
    if not order_id:
        return jsonify({'message': 'Bad Request, please enter a valid order ID'}), 400

    # Fetch the order from the database
    order = db.session.get(OrderModel, order_id)
    if not order:
        return jsonify({'message': 'Order ID not found'}), 404

    # Check if the order status is 'pending'
    if order.status != 'pending':
        return jsonify({'message': 'Order cannot be canceled as it is not in a pending state'}), 400

    # Update the order status to 'canceled'
    order.status = 'canceled'
    db.session.commit()
    return jsonify({'message': 'Order has been successfully canceled'}), 200


    #Couruier features

#get Courier orders
# Get Courier Orders
@app.route('/CourierOrder', methods=['GET'])  # Corrected endpoint
def get_courier_orders():
    courier_id = request.args.get('courier_id', type=int)
    
    if not courier_id:
        return jsonify({'message': 'Bad request, Please enter a correct ID for the courier'}), 400

    courier = db.session.get(CourierModel, courier_id)
    if not courier:
        return jsonify({'message': 'Courier ID not found'}), 404
    
    # Fetch assigned orders directly related to the courier
    assigned_orders = OrderModel.query.filter(OrderModel.courier_id == courier_id).all() 

    if not assigned_orders:
        return jsonify({'message': 'No assigned orders'}), 200  

    return jsonify([order.json() for order in assigned_orders]), 200

# Accept Order
@app.route('/acceptOrder', methods=['PUT'])
def accept_order():
    data = request.get_json() 
    order_id = data.get('order_id')
    order = OrderModel.query.get(order_id)
    order.status = 'picked up'
    db.session.commit()
    return jsonify({'message': 'Order is accepted successfully'}),200

# Decline Order
@app.route('/DeclineOrder', methods=['PUT'])
def decline_order():
    data = request.get_json() 
    order_id = data.get('order_id')
    order = OrderModel.query.get(order_id)
    order.courier = None
    db.session.commit()
    return jsonify({'message': 'Order is declined successfully'}),200
# Assign Orders to Courier (Initial Assignment)
@app.route('/AssignOrder', methods=['PUT'])
def assign_order_to_courier():
    data = request.get_json()

    order_id = data.get('orderId')  
    courier_id = data.get('courierId')  

    if not order_id:
        return jsonify({'message': 'Bad Request, Please enter the order id you want to assign'}), 400

    order = db.session.get(OrderModel, order_id)
    if not order:
        return jsonify({'message': 'Order ID not found'}), 404

    if not courier_id:
        return jsonify({'message': 'Bad Request, Please enter the Courier id you want to assign to'}), 400

    courier = db.session.get(CourierModel, courier_id)
    if not courier:
        return jsonify({'message': 'Courier ID not found'}), 404


    order.courier = courier
    db.session.commit()

    return jsonify({'message': 'Order is assigned to the courier'}), 200


# Retrieve all assigned orders
@app.route('/admin/assigned-orders', methods=['GET'])
def get_assigned_orders():
    orders = OrderModel.query.filter(OrderModel.courier_id.isnot(None)).all() 
    if not orders:
        return jsonify({'message': 'No assigned orders found'}), 404
    return jsonify([order.json() for order in orders]), 200


#============================================================================
#Courier and Admin Common features
# Update Order Status
@app.route('/UpdateOrderStatus', methods=['PUT'])
def update_order_status():
    try:
        data = request.get_json()
        order_id = data.get('orderId')
        status = data.get('status')

        if not order_id or not status:
            return jsonify({'message': 'Bad Request, Please provide both order_id and status'}), 400

        order = db.session.get(OrderModel, order_id)

        if not order:
            return jsonify({'message': 'Order ID not found'}), 404

        order.status = status
        db.session.commit()

        return jsonify({'message': 'Order status is updated'}), 200
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'Backend is running'}), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    port = int(os.getenv('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=os.getenv('FLASK_ENV') != 'production')