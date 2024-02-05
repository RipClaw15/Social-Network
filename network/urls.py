
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("following", views.following, name="following"),
    path("profile/<str:username>", views.profile_view, name="profile"),

    # API Routes
    path("post", views.compose, name="compose"),
    path("all-posts", views.render_posts, name="posts")
]
