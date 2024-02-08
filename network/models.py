from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    
    bio = models.TextField(null=True)
    birthdate = models.DateField(null=True, blank=True)
    location = models.TextField(blank=True)
    profileimg = models.ImageField(upload_to='profile_images', default='blank-profile-picture.png')
    following = models.ManyToManyField('self', through='Relationship', symmetrical=False, related_name='followers')
    

    def __str__(self):
        return str(self.user)
    

class Post(models.Model):
    author = models.ForeignKey("User", on_delete=models.CASCADE, related_name="author")
    content = models.TextField()
    date_posted = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(User, blank = True, null = True)
    def total_likes(self):
        return self.likes.count()
    def serialize(self, user=None):
        serialized_data = {
            "author": {
                "id": self.author.id,
                "username": self.author.username,
                "profileimg": self.author.profileimg.url
            },
            "content": self.content,
            "date_posted": self.date_posted.strftime("%b %d %Y, %I:%M %p"),
            "likes": [user.id for user in self.likes.all()],
            "total_likes": self.total_likes() ,
            "id": self.id,
        }
        if user is not None:
            serialized_data["user_has_liked"] = user in self.likes.all()
        return serialized_data
    

class Relationship(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user')
    follows = models.ForeignKey(User, on_delete=models.CASCADE, related_name='follows')