document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#compose-form').addEventListener('submit', submit_post );
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

  function render_post(event){
    event.preventDefault();
  }