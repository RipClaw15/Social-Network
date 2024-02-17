import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import redirect

from .models import User, Post


def index(request):
    return render(request, "network/index.html")

def all_posts(request):
    return render(request, "network/all_posts.html")

@csrf_exempt
@login_required
def edit(request, post_id):
    try:
        post = Post.objects.get(author=request.user, pk=post_id)
    except Post.DoesNotExist:
        return JsonResponse({"error": "Post not found."}, status=404)
    
    if request.method == "PUT":
        data = json.loads(request.body)
        post.content = data["body"]
        post.save()
        return HttpResponse(status=204)
    else:
        return JsonResponse({
            "error": "PUT request required."
        }, status=400)


@csrf_exempt
@login_required
def compose(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        content = data['content']
        author = request.user
        post = Post(
            author = author,
            content = content

        )
        post.save()
        print(content)
        return JsonResponse({"message": "Post successfully published"}, status=201)

        # process the content
    return JsonResponse({"error": "POST request required."}, status=400)
    
def render_posts(request):
    base_query = Post.objects
    posts = base_query.order_by("-date_posted").all()
    return JsonResponse([post.serialize(request.user) for post in posts], safe=False)

def follow_unfollow(request, username):
    if request.method == 'POST':
        # Get the user to be followed/unfollowed
        other_user = User.objects.get(username=username)
        if request.user.following.filter(username=username).exists():
            request.user.following.remove(other_user)

        else:
            request.user.following.add(other_user)
        return redirect('profile', username=username)
    return redirect('profile', username=username)

def liked_by_current_user(request, post_id):
    # Get the post
    post = Post.objects.get(id=post_id)

    # Check if the current user has liked this post
    liked = request.user.id in post.likes.values_list('id', flat=True)
   
    # Return the result as a JSON response
    return JsonResponse({'liked': liked})

def follow_list(request, username):
    user = User.objects.get(username=username)
    followers_usernames = user.followers_list()
    following_usernames = user.following_list()
    print("Followers:", followers_usernames)
    print("Following:", following_usernames)


@csrf_exempt
def like_post(request, post_id):
    if request.method == "POST":
        try:
            post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            return JsonResponse({'error': 'Post not found'}, status=404)

        if request.user in post.likes.all():
            post.likes.remove(request.user)
            action = 'unliked'
        else:
            post.likes.add(request.user)
            action = 'liked'
        post.save()
        return JsonResponse({'success': True,
                             'action': action})
    else:
        return JsonResponse({'error': 'Invalid request'}, status=400)

def profile_posts(request, username):
    user = User.objects.get(username=username)
    base_query = Post.objects.filter(author=user)
    posts = base_query.order_by("-date_posted").all()
    
    return JsonResponse([post.serialize (request.user) for post in posts], safe=False)

def profile_view(request, username):
    user = User.objects.get(username=username)
    following_count = user.followers.count()
    followers_count = user.following.count()
    followers_usernames = user.my_followers()
    following_usernames = user.who_I_follow()   
    profile_img = user.profileimg
    if request.user.is_authenticated:
        is_following = request.user.following.filter(username=username).exists()
    else:
        is_following = False
    return render(request, "network/profile.html", 
                  {'name':username, 
                   'profile_img': profile_img,
                   'following_count':following_count, 
                   'followers_count': followers_count, 
                   'is_following': is_following,
                   'followers_usernames': followers_usernames,
                   'following_usernames': following_usernames
                   })

def following(request):
    return render(request, "network/following.html")

def following_posts(request):
    
    user = User.objects.get(username=request.user.username)
    following = user.following.all()
    
    base_query = Post.objects.filter(author__in=following)
    posts = base_query.order_by("-date_posted").all()
    return JsonResponse([post.serialize (request.user) for post in posts], safe=False)
    

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
