from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import InputRequired, Email, EqualTo

class RegisterForm(FlaskForm):
    username = StringField('Display Name', validators=[InputRequired()])
    email = StringField('Email', validators=[InputRequired(), Email()])
    password = PasswordField('Password', validators=[InputRequired()])
    confirm_password = PasswordField('Confirm Password', validators=[
        InputRequired(), EqualTo('password', message='Passwords must match.')
    ])
    submit = SubmitField('Sign Up')
