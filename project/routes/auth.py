from flask import Blueprint,render_template,request,redirect,url_for
from project.modules import Admin
from project.settings import ADMIN_CODE
from project.extentions import db
from werkzeug.security import check_password_hash
from flask_login import login_user,current_user,logout_user
auth = Blueprint('auth', __name__)
@auth.route('/login',methods=["GET","POST"])
def login():
    if request.method == "POST":
        email=request.form.get("email")
        tick = request.form.get("remember") == "yes"
        password=request.form.get("password")
        admin = db.session.execute(db.select(Admin).where(Admin.email == email)).scalar_one_or_none()
        if admin and check_password_hash(admin.password_hash,password):
            login_user(admin, remember=tick)
            return redirect(url_for("main.index"))
        return redirect(url_for("auth.register"))


    return render_template("login.html")


@auth.route('/register',methods=["POST","GET"])
def register():
    if request.method == "POST":
        name = request.form.get("username")
        email = request.form.get("email")
        pass1 = request.form.get("password1")
        pass2 = request.form.get("password2")
        admin_code =request.form.get("admin_code")
        if pass1 == pass2 and admin_code == ADMIN_CODE:
            admin = Admin(
                name = name,
                password = pass1,
                email = email
            )
            db.session.add(admin)
            db.session.commit()
            return redirect(url_for("auth.login"))
        return render_template("register.html")
    
    return render_template("register.html")


@auth.route("/logout")
def logout():
    logout_user()
    return redirect(url_for("auth.login"))