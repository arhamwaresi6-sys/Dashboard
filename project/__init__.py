from flask import Flask
from .routes.auth import auth
from .routes.main import main
from .routes.api import api
from .extentions import db,login_manager
from .modules import Admin
from .commands import create_table,create_customer,create_product,query1
def create_app(config_object='project.settings'):
    app = Flask(__name__)
    app.config.from_object(config_object)


    app.cli.add_command(create_table)
    app.cli.add_command(create_customer)
    app.cli.add_command(create_product)
    app.cli.add_command(query1)


    db.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view="auth.login"
    
    @login_manager.user_loader
    def load_user(user_id):
       return db.session.get(Admin, int(user_id))


    app.register_blueprint(auth)
    app.register_blueprint(main)
    app.register_blueprint(api,url_prefix='/api')
    return app