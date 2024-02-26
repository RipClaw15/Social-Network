from django.test import TestCase
from .models import User, Post


from selenium import webdriver
from django.test import LiveServerTestCase

class UserModelTest(TestCase):
    def test_str_method(self):
        user = User.objects.create(username="testuser")
        self.assertEqual(str(user), "testuser")

class UserModelTest(TestCase):
    def test_who_I_follow(self):
        user1 = User.objects.create(username="user1")
        user2 = User.objects.create(username="user2")
        user1.following.add(user2)
        self.assertEqual(user1.who_I_follow(), ["user2"])

driver = webdriver.Chrome()


