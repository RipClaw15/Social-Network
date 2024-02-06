document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.startsWith('/profile/')) {
        let username = window.location.pathname.split('/')[2];
        render_profile_post(username);
    }
});

function render_profile_post(username){
    let apiUrl = `/profile-posts/${username}`;

    fetch(apiUrl)
    .then(response => response.json())
    .then(posts => {
        console.log(posts);
        let postList = document.createElement('div');
        postList.classList.add('posts');
        let profilePostsView = document.querySelector('#profile-posts-view');
        console.log(profilePostsView);
        profilePostsView.appendChild(postList);
        posts.forEach(poste => {
          const postv = document.createElement('div');
          postv.setAttribute('class','postv')
            postv.innerHTML = `
                            <div class="post-item">
                              <span class="author">
                                By <b><a href="/profile/${poste['author'].username}"style="color: inherit; text-decoration: none;">${poste['author'].username}</a></b>
                              </span>
                              <br>
                              <span class="content">
                                ${poste['content']}
                              </span>
                              <br>
                              <span class="date-posted">
                                <b>${poste['date_posted']}</b>
                              </span>
                            </div>`;
          postList.appendChild(postv);
        })

    })
  }