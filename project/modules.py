from .extentions import db
from datetime import datetime
from flask_login import UserMixin
from werkzeug.security import generate_password_hash
class Customer(db.Model):
    id = db.Column(db.Integer,primary_key = True)
    name = db.Column(db.String(100),nullable = False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    orders = db.relationship("Order",lazy = True,backref="customer")




class Product(db.Model):
    id = db.Column(db.Integer,primary_key = True)
    name = db.Column(db.String(100),nullable = False)
    category = db.Column(db.String(100),nullable = False)
    price = db.Column(db.Numeric(10,2))
    goal = db.Column(db.Numeric(10,2))
    stock = db.Column(db.Integer,default = 0)
    status = db.Column(db.Boolean ,default=False)
    description = db.Column(db.Text)
    orders = db.relationship("Order",lazy = True,backref="product")
    images = db.relationship("ProductImage",lazy = True,backref="product")
    @property
    def total_revenue(self):
        # Optional: filter by completed orders if you only want paid revenue
        return sum(
            order.quantity * self.price 
            for order in self.orders 
            if order.status == 'Completed'
        )
    @property
    def goal_percentage(self):
        # Calculates the percentage of the goal achieved
        if self.goal and self.goal > 0:
            percentage = (float(self.total_revenue) / float(self.goal)) * 100
            # Returns rounded value (e.g., 92.5 becomes 92.5 or round to int if preferred)
            return round(percentage, 1)
        return 0.0
    @property
    def initials(self):
        words = self.name.split()

        if len(words) >= 2:
         return words[0][0] + words[1][0]

        return words[0][0]




class ProductImage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    url = db.Column(db.Text, nullable=False) # Changed from db.String(100) to db.Text

    product_id = db.Column(
        db.Integer,
        db.ForeignKey("product.id"),
        nullable=False
    )
     
    


class Order(db.Model):
    id = db.Column(db.Integer,primary_key = True)
    customer_id = db.Column(db.Integer,db.ForeignKey(Customer.id))
    product_id = db.Column(db.Integer,db.ForeignKey(Product.id,ondelete="CASCADE"))
    quantity = db.Column(db.Integer)
    status = db.Column(db.Enum('Pending','Cancelled','Completed') ,default="Pending")
    purchase_date = db.Column(db.Date,nullable = False)
    @property
    def total_amount(self):
        return self.quantity * self.product.price






class Admin(db.Model,UserMixin):
    id = db.Column(db.Integer,primary_key = True)
    name = db.Column(db.String(100),nullable = False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    email = db.Column(db.String(50),unique = True)
    @property
    def password(self):
        return "cant give u pass"
    @password.setter
    def password(self,password):
         self.password_hash = generate_password_hash(password)