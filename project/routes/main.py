from flask import Blueprint,render_template,redirect,request,jsonify
from flask_login import current_user
from project.modules import Customer,Order,Product
from project.extentions import db
from datetime import datetime
from flask_login import login_required
from werkzeug.security import check_password_hash, generate_password_hash
main = Blueprint('main', __name__)
@main.route('/')
@login_required
def index():
    orders_per_month = db.session.execute(
        db.select(
            db.func.extract('year', Order.purchase_date),
            db.func.extract('month', Order.purchase_date),
            db.func.count()
        )
        .select_from(Order)
        .group_by(
            db.func.extract('year', Order.purchase_date),
            db.func.extract('month', Order.purchase_date)
        )\
        .order_by(
            db.func.extract('year', Order.purchase_date),
            db.func.extract('month', Order.purchase_date)
        )
    ).all()

    orders_stats = db.session.execute(
                db.select(
                    Order.status,
                    db.func.count()
                )
                .select_from(Order)
                .group_by(
                    Order.status
                )\
                .order_by(
                    Order.status
                )
            ).all()
    

    customers_per_month = db.session.execute(
            db.select(
                db.func.extract('year', Customer.created_at),
                db.func.extract('month', Customer.created_at),
                db.func.count()
            )
            .select_from(Customer)
            .group_by(
                db.func.extract('year', Customer.created_at),
                db.func.extract('month', Customer.created_at)
            )\
            .order_by(
                db.func.extract('year', Customer.created_at),
                db.func.extract('month', Customer.created_at)
            )
        ).all()

    revenue_per_month = db.session.execute(
        db.select(
            db.func.extract('year', Order.purchase_date),
            db.func.extract('month', Order.purchase_date),
            db.func.sum(Order.quantity * Product.price)
        )\
        .join(Product,Order.product_id == Product.id)\
        .select_from(Order)
        .group_by(
            db.func.extract('year', Order.purchase_date),
            db.func.extract('month', Order.purchase_date)
        )\
        .order_by(
            db.func.extract('year', Order.purchase_date),
            db.func.extract('month', Order.purchase_date)
        )
    ).all()


    customer_this_month = 0
    order_this_month = 0
    customer_last_month = 0
    order_last_month = 0
    revenue_this_month = 0
    revenue_last_month = 0
    revenue_this_year = 0


    current_month = datetime.today().month
    current_year = datetime.today().year
    if current_month == 1:
        last_month = 12
        last_year = current_year - 1
    else:
        last_month = current_month - 1
        last_year = current_year
   
    for year, month, count in customers_per_month:
        if year == current_year and month == current_month:
            customer_this_month = count

        if year == last_year and month == last_month:
            customer_last_month = count
        

    for year, month, count in orders_per_month:
        if year == current_year and month == current_month:
         order_this_month = count

        if year == last_year and month == last_month:
          order_last_month = count


    for year, month, revenue in revenue_per_month:
     if year == current_year and month == current_month:
          revenue_this_month = revenue

     if year == last_year and month == last_month:
          revenue_last_month = revenue
    customer_increased = (
        (customer_this_month - customer_last_month)
        / customer_last_month * 100
    ) if customer_last_month else 100

    order_increased = (
        (order_this_month - order_last_month)
        / order_last_month * 100
    ) if order_last_month else 100

    revenue_increased = (
      (revenue_this_month - revenue_last_month)
     / revenue_last_month * 100
    ) if revenue_last_month else 100

    for per_month in revenue_per_month:
                if(per_month[0] == current_year):
                    revenue_this_year += per_month[2]

    # Fetch all products from the database
    all_products = Product.query.all()

    sorted_products = sorted(
        all_products, 
        key=lambda p: p.total_revenue, 
        reverse=True
    )

    top_3_products = sorted_products[:3]
    months = [
        "January",
        "February",
         "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ]
    dataMonth =(months[current_month - 1:] + months[:current_month - 1])[-7:]
    revenue_data = []
    for i in range(7):
        month = current_month - i
        year = current_year 
        revenue = 0
        if month <= 0:
            month += 12
            year -= 1
        for Year, Month, count in revenue_per_month:
                 if Year == year and Month == month:
                  revenue += count
                  break
        revenue_data.append(revenue)
    box_chart_data = {
       "dataMonth" : dataMonth,
       "revenue_data":revenue_data
    }

    status_counts = {
    "Completed": 0,
    "Pending": 0,
    "Cancelled": 0
}

    for status, count in orders_stats:
     status_counts[status] = count

    completed = status_counts["Completed"]
    pending = status_counts["Pending"]
    cancelled = status_counts["Cancelled"]

    total_orders = completed + pending + cancelled

    if total_orders:
        stats_data = [
            round(completed / total_orders * 100),
            round(pending / total_orders * 100),
            round(cancelled / total_orders * 100)
        ]
    else:
         stats_data = [0, 0, 0]
    context = {
        "current_user":current_user,
        "total_customer":customer_this_month,
        "total_orders":order_this_month,
        "customer_increased":customer_increased,
        "order_increased":order_increased,
        "revenue":revenue_this_month,
        "revenue_increased":revenue_increased,
        "revenue_this_year":revenue_this_year,
        "boxChartData":box_chart_data,
        "pie_data":stats_data,
        "top_3_products":top_3_products

    }
    return render_template("index.html",**context)




@main.route('/table')
@login_required
def table():
    orders = db.session.execute(
        db.select(Order).limit(10).order_by(Order.purchase_date)
    ).scalars().all()
    orders_stats = db.session.execute(
                    db.select(
                        Order.status,
                        db.func.count()
                    )
                    .select_from(Order)
                    .group_by(
                        Order.status
                    )\
                    .order_by(
                        Order.status
                    )
                ).all()
    status_counts = {
        "Completed": 0,
        "Pending": 0,
        "Cancelled": 0
    }
    
    for status, count in orders_stats:
        status_counts[status] = count
    
    completed = status_counts["Completed"]
    pending = status_counts["Pending"]
    cancelled = status_counts["Cancelled"]
    
    total_orders = completed + pending + cancelled
    
    if total_orders:
        stats_data = [
            round(completed / total_orders * 100),
            round(pending / total_orders * 100),
            round(cancelled / total_orders * 100)
        ]
    else:
            stats_data = [0, 0, 0]
    context = {
        "current_user":current_user,
        "orders":orders,
        "total_orders":total_orders,
        "completed":completed,
        "pending":pending,
        "cancelled":cancelled,
        "stats_data":stats_data
    }
    return render_template("table.html",**context)



@main.route('/products')
def products():
    return render_template("products.html",current_user=current_user)
@main.route('/settings')
def settings():
    return render_template("settings.html")
@main.route("/settings/password", methods=["POST"])
@login_required
def change_password():

    data = request.get_json()

    current_password = data.get("current_password")
    new_password = data.get("new_password")


    if not current_password or not new_password:
        return jsonify({
            "error": "All fields are required."
        }), 400


    # Check old password
    if not check_password_hash(
        current_user.password_hash,
        current_password
    ):
        return jsonify({
            "error": "Current password is incorrect."
        }), 401


    # Save new password hash
    current_user.password_hash = generate_password_hash(
        new_password
    )

    db.session.commit()


    return jsonify({
        "message": "Password updated successfully."
    }), 200