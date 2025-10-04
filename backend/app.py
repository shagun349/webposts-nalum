from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///posts.db'
db = SQLAlchemy(app)

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    content = db.Column(db.String(500), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content
        }

def setup_on_startup():
    """
    Move the original body of the @app.before_first_request function here.
    For example: create DB tables, seed data, etc.
    """
    # Ensure tables exist when running under Gunicorn on Render
    with app.app_context():
        db.create_all()

# register for Flask versions that support before_first_request, otherwise run now
if hasattr(app, "before_first_request"):
    app.before_first_request(setup_on_startup)
else:
    # run immediately (inside app context) so startup tasks still run
    try:
        with app.app_context():
            setup_on_startup()
    except Exception as _e:
        print("startup init failed:", _e)

@app.route('/posts', methods=['POST'])
def create_post():
    data = request.get_json()
    new_post = Post(title=data['title'], content=data['content'])
    db.session.add(new_post)
    db.session.commit()
    return jsonify(new_post.to_dict()), 201

@app.route('/posts', methods=['GET'])
def get_posts():
    posts = Post.query.all()
    return jsonify([post.to_dict() for post in posts])

@app.route('/posts/<int:id>', methods=['PUT'])
def update_post(id):
    post = Post.query.get(id)
    if not post:
        return jsonify({'message': 'Post not found'}), 404
    data = request.get_json()
    post.title = data['title']
    post.content = data['content']
    db.session.commit()
    return jsonify(post.to_dict())

@app.route('/posts/<int:id>', methods=['DELETE'])
def delete_post(id):
    post = Post.query.get(id)
    if not post:
        return jsonify({'message': 'Post not found'}), 404
    db.session.delete(post)
    db.session.commit()
    return jsonify({'message': 'Post deleted'})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
