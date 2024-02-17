function CreatePost() {
    const [content, setContent] = React.useState("");

    const handleSubmit = (event) => {
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
    };

    const handleChange = (event) => {
        setContent(event.target.value);
    };

    return (
        <form onSubmit={handleSubmit}>
            <input 
                type="text" 
                value={content} 
                onChange={handleChange} 
                placeholder="What's on your mind?" 
            />
            <button type="submit">Post</button>
        </form>
    );
}

export default CreatePost;