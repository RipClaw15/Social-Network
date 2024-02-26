import json
import random
import time

from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import redirect
from django import forms
from django.contrib import messages


from .models import User, Post

class ProfileForms(forms.ModelForm):
    profileimg = forms.ImageField(label="Profile Picture")

    class Meta:
        model = User
        fields = ('profileimg',)

class BioForms(forms.ModelForm):
    bio = forms.CharField(label="Bio")

    class Meta:
        model = User
        fields = ('bio',)

def user_suggestion(request):
    
    user_info = [(user.username, user.profileimg) for user in User.objects.all()]
    
    user_info = [{'username': user.username, 'profileimg': '/media/' + str(user.profileimg)} for user in User.objects.all() if user != request.user]
    random.shuffle(user_info)   
    if user_info:
        return JsonResponse(user_info, safe=False)

    else:
        return JsonResponse({"suggestions": 'No one to know'}, status=201)
            
       


def search_user(request):
    if request.method == "GET":
        q = request.GET.get('q', '')
        usernames = [user.username for user in User.objects.all()]        
        lowercase_results = [item.lower() for item in usernames]
        lowercase_dict = {item.lower(): item for item in usernames}
        sub_strings = [lowercase_dict[item] for item in lowercase_results if q.lower() in item]

        if sub_strings:
            return render(request, "network/search.html", {"entries": sub_strings})
        else:
            return render(request, "network/search.html", {"message": f"No user with {q} in it's name found."})
    else:
        return render(request, "network/search.html", {"message": "Method is not GET!"})
    
def edit_bio(request):
    if request.user.is_authenticated:
        if request.method == 'POST':
            current_user = request.user
            bio_form = BioForms(request.POST, instance=current_user)
            if bio_form.is_valid():
                bio_form.save()
                return redirect('profile', username=current_user.username)
        else:
            form = BioForms()
        return render(request, 'profile.html', {'form': form})
    else:
        return redirect('login')
        

def profile_pic_view(request):
    
    if request.user.is_authenticated:
        print(request.user.is_authenticated)
        if request.method == 'POST':
            current_user = request.user
            form = ProfileForms(request.POST or None, request.FILES or None, instance=current_user)
            
            if form.is_valid():
                
                form.save()
            
                
                return redirect('profile', username=current_user.username)
        else:
            form = ProfileForms()

        return render(request, 'profile.html', {'form': form})
    else:
        return redirect('login')


def success(request):
    return HttpResponse('successfully uploaded')

@csrf_exempt
def index(request):
    if request.user.is_authenticated:
        return redirect('all_posts')
    else:
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
    
    start = int(request.GET.get("start") or 0)
    end = int(request.GET.get("end") or (start + 9))
    
    base_query = Post.objects
    posts = base_query.order_by("-date_posted")[start:end+1]
    time.sleep(1)
    return JsonResponse([post.serialize(request.user) for post in posts], safe=False)

def follow_unfollow(request, username):
    if request.method == 'POST':
        
        other_user = User.objects.get(username=username)
        if request.user.following.filter(username=username).exists():
            request.user.following.remove(other_user)

        else:
            request.user.following.add(other_user)
        return redirect('profile', username=username)
    return redirect('profile', username=username)

def liked_by_current_user(request, post_id):
    
    post = Post.objects.get(id=post_id)

    
    liked = request.user.id in post.likes.values_list('id', flat=True)
   
    
    return JsonResponse({'liked': liked})


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

from django.http import Http404

def profile_view(request, username):
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        raise Http404("User does not exist")

    if request.user.is_authenticated:
        following_count = user.followers.count()
        followers_count = user.following.count()
        posts_count = Post.objects.filter(author=user).count()
        bio = user.bio
        form = ProfileForms(instance=request.user)
        profile_img = user.profileimg
        
        is_following = request.user.following.filter(username=username).exists()
        
        return render(request, "network/profile.html", 
                      {'name':username, 
                       'posts_count': posts_count,
                       'profile_img': profile_img,
                       'bio': bio,
                       'following_count': following_count, 
                       'followers_count': followers_count, 
                       'is_following': is_following,
                       'form': form
                       })
    else:
        return redirect('login')


def follow_list(request, username):
    user = User.objects.get(username=username)
    followers_usernames = user.my_followers()
    following_usernames = user.who_I_follow()  
    return JsonResponse({
        'followers': followers_usernames,
        'following': following_usernames
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
