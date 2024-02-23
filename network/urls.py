
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("all_posts", views.all_posts, name="all_posts"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("following", views.following, name="following"),
    path("profile/<str:username>", views.profile_view, name="profile"),
    path('follow_unfollow/<str:username>/', views.follow_unfollow, name='follow_unfollow'),
    path("post/<int:post_id>/like", views.like_post, name="like_post"),
    path('image_upload', views.profile_pic_view, name='image_upload'),
    path('success', views.success, name='success'),
    

    # API Routes
    path("post", views.compose, name="compose"),
    path("all-posts", views.render_posts, name="posts"),
    path('post/<int:post_id>/edit', views.edit, name="edit"),
    path("following-posts", views.following_posts, name="following_posts"),
    path("profile-list/<str:username>", views.follow_list, name="follow_list"),
    path("profile-posts/<str:username>", views.profile_posts, name="profile-posts"),
    path("post/<int:post_id>/liked_by_current_user", views.liked_by_current_user, name="liked_by_current_user"),
    
]
