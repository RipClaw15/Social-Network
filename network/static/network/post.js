let counter = 0;

const quantity = 10;

document.addEventListener('DOMContentLoaded', function() {
  
  
  if (window.location.pathname === '/all_posts') {
    
      more_posts();
      window.onscroll = () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
          more_posts();
        }
    };
  }

  if (window.location.pathname === '/following') {
    let apiUrl = `/following-posts`;
      render_post(apiUrl);
  }
  
  
  if (window.location.pathname.startsWith('/profile/')) {
      let username = window.location.pathname.split('/')[2];
      let apiUrl = `/profile-posts/${username}`;
      render_post(apiUrl);
  }

  user_suggestions()
  
});

function more_posts(){
  const start = counter;
  const end = start + quantity - 1;
  counter = end + 1;
  document.querySelector('#all-posts').addEventListener('click', render_post);
  let apiUrl = `/posts?start=${start}&end=${end}`;
  render_post(apiUrl);
}



function user_suggestions() {
  fetch(`/suggestions`)
    .then(response => response.json())
    .then(data => {
      
      const suggestions = data;
      if (Array.isArray(suggestions)) { 
        let suggestionList = document.createElement('div');
        suggestionList.classList.add('suggestions');
        document.querySelector('.user-suggestions').appendChild(suggestionList);
        suggestions.forEach(suggestionsData => {
          
          let suggestionDiv = createSugesstionHTML(suggestionsData);
          suggestionList.appendChild(suggestionDiv);
        });
      } else {
        console.error('Invalid format of suggestions:', suggestions);
      }
    })
    .catch(error => {
      console.error('Error fetching suggestions:', error);
    });
}



function render_post(apiUrl){ 
    

    fetch(apiUrl)
    .then(response => response.json())
    .then(posts => {
        
        let postList = document.createElement('div');
        postList.classList.add('posts');
        document.querySelector('#posts-view').appendChild(postList);
        posts.forEach(postData => {
            
            let postDiv = createPostHTML(postData);  
                            
            liked_by_current_user(postData, postDiv);  
        
            like_post(postData, postDiv);

            postList.appendChild(postDiv);

            edit_post (postData, postDiv);
           
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
  function createSugesstionHTML(suggestionData){
    const suggestionDiv = document.createElement('div');
    suggestionDiv.setAttribute('class','suggestionDiv');
    
    suggestionDiv.innerHTML = `
                               <a href="/profile/${suggestionData['username']}" style="color: inherit; text-decoration: none;"><img src="${suggestionData['profileimg']}" width="50" class="post-pic"> ${suggestionData['username']}</a>
                               
                               `
    return suggestionDiv;
  }



  function createPostHTML(postData){

          const postDiv = document.createElement('div');
          postDiv.setAttribute('class','postDiv')
          
          postDiv.innerHTML = `
                              <div class="edit-view" id="edit-view-${postData['id']}">

                              </div>
                              <div class="post-item" id="post-${postData['id']}">
                                <div class="up-row">
                                  <span class="author">
                                    <img src="${postData['author'].profileimg}" alt="Profile Picture" width="100" class="post-pic">
                                      By 
                                        <b>
                                          <a href="/profile/${postData['author'].username}" style="color: inherit; text-decoration: none;">${postData['author'].username}</a>
                                        </b>
                                  </span>
                                  <span class="date-posted">
                                    <b>
                                      ${postData['date_posted']}
                                    </b>
                                  </span>
                                </div>
                                <hr>
                                <div class="middle-row">
                                  <span id="post-content-${postData['id']}" class="content">
                                    <h3>${postData['content']}</h3>
                                  </span>
                                  <div class="edit">
                                    ${postData['is_author'] ? `<button class="edit-button" data-post-id="${postData['id']}" id="edit-${postData['id']}">Edit</button>` : ''}
                                  </div>
                                </div>
                                <hr>
                                <div class="lower-row">
                                  <span>
                                    <b>
                                      <button class="like-button" data-post-id="${postData['id']}">
                                        <i style='font-size:36px;' class='far'>&#xf004;</i>
                                      </button>
                                      <span class="likes">
                                        ${postData['total_likes']}
                                      </span>
                                  </span>
                                  <span class="comments">
                                    Comments
                                    0
                                    </b>
                                  </span>   
                                </div>
                              </div>`;
                              
        return postDiv;

  }

  function edit_post (postData)
  {
    if (postData.is_author){
      document.querySelector('#edit-' + postData['id']).addEventListener('click', (event) => {
        let editButtons = document.querySelectorAll('.edit-button');
        editButtons.forEach(button => button.disabled = true);
        let postId = event.target.dataset.postId;
        let content = postData.content;
        console.log(content);
        document.querySelector('#post-' + postId).style.display= 'none';
        document.querySelector('#edit-view-' + postId).style.display = 'block';
        document.querySelector('#edit-view-' + postId).innerHTML = 
        `<div class="edit-form">  
            <div class="up-row">
            <span class="author">
              <img src="${postData['author'].profileimg}" alt="Profile Picture" width="100" class="post-pic">
                By 
                  <b>
                    <a href="/profile/${postData['author'].username}" style="color: inherit; text-decoration: none;">${postData['author'].username}</a>
                  </b>
            </span>
            <span class="date-posted">
              <b>
                ${postData['date_posted']}
              </b>
            </span>
          </div>
          <hr>
          <h3>Edit Post</h3>
              <form id="compose-form-${postData['id']}">
                <textarea id="compose-body-${postData['id']}"></textarea>
                <hr>
                <input type="submit" class="btn btn-primary"/>
              </form>
         </div>    `;

         setTimeout(function() {
          let textarea = document.querySelector('#compose-body-' + postData['id']);
          console.log(textarea);
          textarea.addEventListener('input', function() {
              console.log("a");
              this.style.height = 'auto';
              this.style.height = (this.scrollHeight) + 'px';
              console.log(this.scrollHeight);
          });
          let event = new Event('input');
          textarea.dispatchEvent(event);
      }, 0);

          
         let handleSubmit = (event) => {
          event.preventDefault();
          console.log(content);
            const body_content = document.querySelector('#compose-body-' + postId).value;
            fetch(`/post/${postId}/edit`, 
              {
                method: 'PUT',
                body: JSON.stringify({body: body_content})
              })
            .then(() => 
            {
              document.querySelector(`#post-content-${postId} h3`).textContent = body_content;
              document.querySelector('#edit-view-' + postId).style.display = 'none';
              document.querySelector('#post-' + postId).style.display= 'block';
              document.querySelector('#compose-form-' + postId).removeEventListener('submit', handleSubmit);
              editButtons.forEach(button => button.disabled = false);         
            })
      }
        document.querySelector('#compose-body-' + postId).value = content;
        document.querySelector('#compose-form-' + postId).addEventListener('submit', handleSubmit);
        

      })
      
    }
  }