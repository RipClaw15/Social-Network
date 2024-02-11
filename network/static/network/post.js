document.addEventListener('DOMContentLoaded', function() {
  // Check if it's the all-posts page
  if (window.location.pathname === '/all_posts') {
      document.querySelector('#compose-form').addEventListener('submit', submit_post);
      document.querySelector('#all-posts').addEventListener('click', render_post);
      render_post();
  }

  if (window.location.pathname === '/following') {
    render_following_posts();
  }
  
  // Check if it's a profile page
  if (window.location.pathname.startsWith('/profile/')) {
      let username = window.location.pathname.split('/')[2];
      render_profile_post(username);
  }
});

function submit_post(event) {
    event.preventDefault();
    
    const content = document.querySelector('#compose-content').value;
    fetch('/post', {
      method: 'POST',
      body: JSON.stringify({
          
        content: content
          
      })
    })
    .then(response => response.json())
    .then(result => {
        window.location.reload();
    });
  }

function render_following_posts(){
  let apiUrl = `/following-posts`;

  fetch(apiUrl)
    .then(response => response.json())
    .then(posts => {
        
        let postList = document.createElement('div');
        postList.classList.add('posts');
        document.querySelector('#posts-view').appendChild(postList);
        posts.forEach(postData => {
            
            let postDiv = createPostHTML(postData);  
                            
            liked_by_current_user(postData, postDiv)  
        
            like_post(postData, postDiv)

            postList.appendChild(postDiv);
        })

    })
}

function render_post(){ 
    let apiUrl = `/all-posts`;

    fetch(apiUrl)
    .then(response => response.json())
    .then(posts => {
        
        let postList = document.createElement('div');
        postList.classList.add('posts');
        document.querySelector('#posts-view').appendChild(postList);
        posts.forEach(postData => {
            
            let postDiv = createPostHTML(postData);  
                            
            liked_by_current_user(postData, postDiv)  
        
            like_post(postData, postDiv)

            postList.appendChild(postDiv);
        })

    })
  }

  function render_profile_post(username){
    let apiUrl = `/profile-posts/${username}`;

    fetch(apiUrl)
    .then(response => response.json())
    .then(posts => {
        console.log(posts);
        let postList = document.createElement('div');
        postList.classList.add('posts');
        let profilePostsView = document.querySelector('#posts-view');
        
        profilePostsView.appendChild(postList);
        posts.forEach(postData => {

            let postDiv = createPostHTML(postData);  
                       
            liked_by_current_user(postData, postDiv)  
          
            like_post(postData, postDiv)

            postList.appendChild(postDiv);

            if (postData.is_author){
              document.querySelector('#edit-' + postData['id']).addEventListener('click', (event) => {
                let postId = event.target.dataset.postId;
                let post = document.querySelector(`#post-${postId}`);
                let content = postData.content;
                console.log(content);
                document.querySelector('#post-' + postId).style.display= 'none';
                document.querySelector('#edit-view-' + postId).style.display = 'block';
                document.querySelector('#edit-view-' + postId).innerHTML = 
                `<div class="edit-form">
                    <h3>Edit Post</h3>
                      <form id="compose-form">
                        <textarea id="compose-body"></textarea>
                        <br>
                        <input type="submit" class="btn btn-primary"/>
                      </form>
                 </div>
                `
                document.querySelector("#compose-body").value = content;
                
                document.querySelector('#compose-form').addEventListener('submit', (event) => {

                event.preventDefault();

                const body_content = document.querySelector('#compose-body').value;

                fetch(`/post/${postId}/edit`, {
                  method: 'PUT',
                  
                  body: JSON.stringify({
                    body: body_content
                  })
                })
                .then(() => {

                  document.querySelector(`#post-content-${postId}`).textContent = body_content;

                  document.querySelector('#edit-view-' + postId).style.display = 'none';
                  document.querySelector('#post-' + postId).style.display= 'block';
                  
                })
                
              })

              })

            }
        })

    })
  }

  function liked_by_current_user(postData, postDiv) {
    fetch(`/post/${postData['id']}/liked_by_current_user`)
    .then(response => response.json())
    .then(data => {
        const likeButton = postDiv.querySelector('.like-button');

        if (data.liked) {
          likeButton.innerHTML = "<i style='font-size:36px;' class='fas'>&#xf004;</i>";
          likeButton.title = "Unlike";
      } else {
          likeButton.innerHTML = "<i style='font-size:36px;' class='far'>&#xf004;</i>";
          likeButton.title = "Like";
      }
    });
}


  function like_post(postData, postDiv) {
    postDiv.querySelector('.like-button').addEventListener('click', (event) => {
        const postId = postData['id'];
        
        let likeButton = postDiv.querySelector('.like-button');
        likeButton.disabled = true;

        let likesCount = postDiv.querySelector('.likes');
        let count = parseInt(likesCount.textContent);

        fetch(`/post/${postId}/like`, {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
          if (data.action === 'liked') {
            likeButton.innerHTML = "<i style='font-size:36px;' class='fas'>&#xf004;</i>";
            likeButton.title = "Unlike";
            count++;
        } else {
            likeButton.innerHTML = "<i style='font-size:36px;' class='far'>&#xf004;</i>";
            likeButton.title = "Like";
            count--;
        }
        likesCount.textContent = `${count}`;
        likeButton.disabled = false;
        });
    });
}




  function createPostHTML(postData){

          const postDiv = document.createElement('div');
          postDiv.setAttribute('class','postDiv')
          postDiv.innerHTML = `
                              <div class="edit-view" id="edit-view-${postData['id']}">
                              </div>
                              <div class="post-item" id="post-${postData['id']}">
                              <img src="${postData['author'].profileimg}" alt="Profile Picture" width="100" class="prof-pic">
                              <span class="author">
                              ${postData['is_author'] ? `<button data-post-id="${postData['id']}" id="edit-${postData['id']}">Edit</button>` : ''}
                                By <b><a href="/profile/${postData['author'].username}" style="color: inherit; text-decoration: none;">${postData['author'].username}</a></b>
                              </span>
                              <br>
                              <span id="post-content-${postData['id']}" class="content">
                              ${postData['content']}
                              </span>
                              <br>
                              <span class="date-posted">
                                <b>${postData['date_posted']}</b>
                              </span>
                              
                              <button class="like-button" data-post-id="${postData['id']}">
                                <i style='font-size:36px;' class='far'>&#xf004;</i>
                              </button>
                              <span class="likes">
                              ${postData['total_likes']}
                              </span>
                            </div>`;
        return postDiv;

  }