document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#compose-form').addEventListener('submit', submit_post );
    document.querySelector('#all-posts').addEventListener('click', render_post );
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
        console.log("result");
        
    });
  }

  function render_post(){
    
    let apiUrl = `/all-posts`;

    fetch(apiUrl)
    .then(response => response.json())
    .then(posts => {
        console.log(posts);
        let postList = document.createElement('div');
        postList.classList.add('posts');
        document.querySelector('#posts-view').appendChild(postList);
        posts.forEach(poste => {
          const postv = document.createElement('div');
          postv.setAttribute('class','postv')
            postv.innerHTML = `
                            <div class="post-item">
                              <span class="author">
                                By <b>${poste['author'].username}</b>
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