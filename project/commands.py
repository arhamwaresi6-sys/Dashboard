import click
from flask.cli import with_appcontext
from .extentions import db
from .modules import Product,Customer,ProductImage,Order
from faker import Faker
from random import randint , choice
fake = Faker()


@click.command(name = "create_table")
@with_appcontext
def create_table():
    db.create_all()


@click.command(name = "create_product")
@with_appcontext
def create_product():
    for _ in range(5):
        product = Product(
            name = fake.catch_phrase(),
            category = choice(["electronics", "food", "accessory"]),
            price = randint(1,20),
            goal = randint(500,2000),
            stock = randint(0,10),
            status = choice([True,False]),
            description = fake.text(max_nb_chars=200)
        )
        db.session.add(product)
        db.session.commit()
@click.command(name = "create_customer")
@with_appcontext
def create_customer():
    for _ in range(40):
        customer = Customer(
            name = fake.name(),
        )
        db.session.add(customer)
        db.session.flush()
        products = db.session.execute(db.select(Product.id)).scalars().all()
        order = Order(
            customer_id = customer.id,
            product_id = choice(products),
            quantity = randint(1,10),
            status = choice(['Pending','Cancelled','Completed']) ,
            purchase_date = fake.date_between(start_date="-2y", end_date="today")
        )
        db.session.add(order)
        db.session.commit()
@click.command(name = "query1")
@with_appcontext
def query1():
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
    
    print(orders_stats)