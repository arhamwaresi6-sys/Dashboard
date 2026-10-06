import os
import uuid
from flask import Blueprint, request
from project.modules import Customer, Order, Product, ProductImage
from project.extentions import db
from project.extentions import  supabase
from project.settings import SUPABASE_BUCKET,SUPABASE_FOLDER

api = Blueprint("api", __name__)



def upload_image_to_supabase(file_storage):
    """Uploads a file storage object to Supabase storage bucket 'New Bucket' under folder 'product_picture' and returns its public URL."""
    if not supabase or not file_storage or not file_storage.filename:
        return None
    
    try:
        # Generate a unique filename to prevent collisions
        ext = file_storage.filename.rsplit(".", 1)[1].lower() if "." in file_storage.filename else "jpg"
        filename = f"{uuid.uuid4()}.{ext}"
        
        # Construct the full path inside the bucket including the folder
        file_path = f"{SUPABASE_FOLDER}/{filename}"
        file_bytes = file_storage.read()
        
        # Upload file bytes to Supabase bucket
        response = supabase.storage.from_(SUPABASE_BUCKET).upload(
            path=file_path,
            file=file_bytes,
            file_options={"content-type": file_storage.content_type or "image/jpeg"}
        )
        
        # Retrieve public URL
        public_url_res = supabase.storage.from_(SUPABASE_BUCKET).get_public_url(file_path)
        return public_url_res
    except Exception as e:
        print("========== SUPABASE UPLOAD ERROR ==========")
        print(e)
        return None


# =========================
# CUSTOMER SEARCH
# =========================

@api.route("/search")
def search():
    name = request.args.get("name", "")

    customers = db.session.execute(
        db.select(Customer)
        .where(Customer.name.ilike(f"{name}%"))
        .limit(5)
    ).scalars().all()

    return [
        {
            "name": customer.name,
            "id": customer.id
        }
        for customer in customers
    ]


# =========================
# PRODUCT DATA
# =========================

def product_data(product):
    return {
        "id": product.id,
        "name": product.name,
        "price": float(product.price) if product.price is not None else 0,
        "goal": float(product.goal) if product.goal is not None else 0,
        "category": product.category,
        "status": product.status,
        "stock": product.stock,
        "description": product.description,
        "total_revenue": float(product.total_revenue) if hasattr(product, 'total_revenue') else 0.0,
        "goal_percentage": product.goal_percentage if hasattr(product, 'goal_percentage') else 0.0,

        "images": [
            {
                "id": image.id,
                "name": image.name,
                "url": image.url
            }
            for image in product.images
        ],

        "initials": product.name[:2].upper() if product.name else "PR"
    }


# =========================
# GET ALL PRODUCTS
# =========================

@api.route("/products", methods=["GET"])
def get_products():
    products = db.session.execute(
        db.select(Product)
    ).scalars().all()

    return [product_data(product) for product in products]


# =========================
# GET ONE PRODUCT
# =========================

@api.route("/products/<int:id>", methods=["GET"])
def get_product(id):
    product = db.session.get(Product, id)

    if not product:
        return {
            "error": "Product not found"
        }, 404

    return product_data(product)


# =========================
# CREATE PRODUCT
# =========================

@api.route("/products", methods=["POST"])
def create_product():
    try:
        status_val = request.form.get("status")
        status_bool = status_val.lower() == "true" if isinstance(status_val, str) else bool(status_val)

        product = Product(
            name=request.form.get("name"),
            price=request.form.get("price") or 0,
            goal=request.form.get("goal") or 0,
            category=request.form.get("category"),
            status=status_bool,
            stock=request.form.get("stock") or 0,
            description=request.form.get("description"),
        )

        db.session.add(product)
        db.session.flush() # Flush to assign an ID for image relation

        # Handle file uploads for image1, image2, image3
        for i in range(1, 4):
            file_key = f"image{i}"
            if file_key in request.files:
                file_obj = request.files[file_key]
                if file_obj and file_obj.filename != "":
                    public_url = upload_image_to_supabase(file_obj)
                    if public_url:
                        img_record = ProductImage(
                            name=file_obj.filename,
                            url=public_url,
                            product_id=product.id
                        )
                        db.session.add(img_record)

        db.session.commit()
        return product_data(product), 201

    except Exception as e:
        db.session.rollback()
        print("========== CREATE ERROR ==========")
        print(e)
        return {"error": str(e)}, 500


# =========================
# UPDATE PRODUCT
# =========================

# =========================
# UPDATE PRODUCT
# =========================

@api.route("/products/<int:id>", methods=["PUT"])
def update_product(id):
    try:
        product = db.session.get(Product, id)

        if not product:
            return {"error": "Product not found"}, 404

        status_val = request.form.get("status")
        if isinstance(status_val, str):
            status_bool = status_val.lower() == "true"
        else:
            status_bool = bool(status_val)

        product.name = request.form.get("name")
        product.category = request.form.get("category")
        product.price = request.form.get("price")
        product.goal = request.form.get("goal") or 0
        product.stock = request.form.get("stock")
        product.status = status_bool
        product.description = request.form.get("description")

        # Handle updating images for image1, image2, image3
        existing_images = list(product.images)
        
        for i in range(1, 4):
            file_key = f"image{i}"
            if file_key in request.files:
                file_obj = request.files[file_key]
                if file_obj and file_obj.filename != "":
                    # Upload new image to Supabase
                    public_url = upload_image_to_supabase(file_obj)
                    if public_url:
                        # If an image already exists at this index position, replace/update it
                        if i - 1 < len(existing_images):
                            img_record = existing_images[i - 1]
                            
                            # Optional: Try deleting the old file from Supabase storage bucket
                            try:
                                if img_record.url:
                                    old_path = img_record.url.split(f"/{SUPABASE_BUCKET}/")[-1]
                                    if SUPABASE_FOLDER in old_path:
                                        supabase.storage.from_(SUPABASE_BUCKET).remove([old_path])
                            except Exception as del_err:
                                print("Old file deletion warning:", del_err)
                            
                            # Update existing record
                            img_record.name = file_obj.filename
                            img_record.url = public_url
                        else:
                            # Otherwise create a new image record
                            img_record = ProductImage(
                                name=file_obj.filename,
                                url=public_url,
                                product_id=product.id
                            )
                            db.session.add(img_record)

        db.session.commit()

        return {
            "message": "Product updated successfully",
            "id": product.id
        }, 200

    except Exception as e:
        db.session.rollback()
        print("========== EDIT ERROR ==========")
        print(type(e).__name__)
        print(e)

        return {
            "error": str(e)
        }, 500

# =========================
# DELETE PRODUCT
# =========================

@api.route("/products/<int:id>", methods=["DELETE"])
def delete_product(id):
    product = db.session.get(Product, id)

    if not product:
        return {
            "error": "Product not found"
        }, 404

    db.session.delete(product)
    db.session.commit()

    return {
        "message": "Product deleted successfully"
    }, 200