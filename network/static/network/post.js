document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#compose-form').addEventListener('submit', submit_post );
    document.querySelector('#all-posts').addEventListener('click', render_post );
    if (window.location.pathname.startsWith('/profile/')) {
      let username = window.location.pathname.split('/')[2];
      render_profile_post(username);
  }
    render_post();
    
});

function submit_post(event) {
    event.preventDefault();
    console.log("result");
    const content = document.querySelector('#compose-content').value;
    fetch('/post', {
      method: 'POST',
      body: JSON.stringify({
          
        content: content
          
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
        window.location.reload();
    });
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
                            
                            
                            fetch(`/post/${postData['id']}/liked_by_current_user`)
                            .then(response => response.json())
                            .then(data => {
                              const likeButton = postDiv.querySelector('.like-button');

                              if (data.liked) {
                                likeButton.textContent = 'Unlike';
                              } else {
                                likeButton.textContent = 'Like';
                              }
                            });

                            
              postDiv.querySelector('.like-button').addEventListener('click', (event) => {
              
              const postId = event.target.dataset.postId;

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
                      event.target.textContent = 'Unlike';
                      count++;
                  } else {
                      event.target.textContent = 'Like';
                      count--;
                  }
                  likesCount.textContent = `${count}`;
                  likeButton.disabled = false;
              });
          });
          postList.appendChild(postDiv);
          })
        

    })
  }

  function createPostHTML(postData){

          const postDiv = document.createElement('div');
          postDiv.setAttribute('class','postDiv')
          postDiv.innerHTML = `
                              <div class="post-item">
                              <img src="${postData['author'].profileimg}" alt="Profile Picture" width="100" class="prof-pic">
                              <span class="author">
                                By <b><a href="/profile/${postData['author'].username}" style="color: inherit; text-decoration: none;">${postData['author'].username}</a></b>
                              </span>
                              <br>
                              <span class="content">
                                ${postData['content']}
                              </span>
                              <br>
                              <span class="date-posted">
                                <b>${postData['date_posted']}</b>
                              </span>
                              <button class="like-button" data-post-id="${postData['id']}">Like</button>
                              <span class="likes">
                              ${postData['total_likes']}
                              </span>
                            </div>`;
        return postDiv;
  }