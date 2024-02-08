
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("following", views.following, name="following"),
    path("profile/<str:username>", views.profile_view, name="profile"),
    path('follow_unfollow/<str:username>/', views.follow_unfollow, name='follow_unfollow'),
    path("post/<int:post_id>/like", views.like_post, name="like_post"),

    # API Routes
    path("post", views.compose, name="compose"),
    path("all-posts", views.render_posts, name="posts"),
    path("profile-posts/<str:username>", views.profile_posts, name="profile-posts"),
    path("post/<int:post_id>/liked_by_current_user", views.liked_by_current_user, name="liked_by_current_user")
]
