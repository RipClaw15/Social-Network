document.addEventListener('DOMContentLoaded', function() {
  
  const followersBtn = document.getElementById("followers");
  const followingsBtn = document.getElementById("followings");
  var settingsButton = document.getElementById("settings");
  var editButton = document.getElementById("edit-bio-btn");
  if (settingsButton) {
    settingsButton.addEventListener("click", function(){
      document.querySelector('.pff').style.display = 'none';
      document.querySelector('.profile-edit').style.display = 'block';
    });
  
  }
  if (editButton) {
    
    editButton.addEventListener("click", function(){
      console.log("click");
      document.querySelector('.bio').style.display = 'none';
      document.querySelector('.edit-bio').style.display = 'block';
      document.querySelector('.edit-bio').style.display = "flex";
      document.querySelector('.edit-bio').style.alignItems = "center";
      document.querySelector('.edit-bio').style.justifyContent = "space-between";
      
    });
  }
  ModalRender(followersBtn);
  ModalRender(followingsBtn);
});

function ModalRender(openBtn) {
  const closeBtn = document.getElementById("closeModal");
  const modal = document.getElementById("modal");

  openBtn.addEventListener("click", async () => {
    modal.classList.add("open");

    let username = window.location.pathname.split('/')[2];
    const response = await fetch(`/profile-list/${username}`);
    const data = await response.json();

    const container = document.getElementById('followers-container');
    container.innerHTML = '';

    if (openBtn.id === "followers") {
      document.getElementById("modal-title").innerText = "Followers";
      const followers = data.followers;
      followers.forEach(follower => {
        const p = document.createElement('p');
        const a = document.createElement('a');
        a.href = `/profile/${follower}`;
        a.style.color = 'inherit';
        a.style.textDecoration = 'none';
        a.textContent = follower;
        p.appendChild(a);
        container.appendChild(p);
      });
    } else if (openBtn.id === "followings") {
      document.getElementById("modal-title").innerText = "Following";
      const following = data.following;
      following.forEach(followingUser => {
        const p = document.createElement('p');
        const a = document.createElement('a');
        a.href = `/profile/${followingUser}`;
        a.style.color = 'inherit';
        a.style.textDecoration = 'none';
        a.textContent = followingUser;
        p.appendChild(a);
        container.appendChild(p);
      });
    }
  });

  closeBtn.addEventListener("click", () => {
    modal.classList.remove("open");
  });
}
