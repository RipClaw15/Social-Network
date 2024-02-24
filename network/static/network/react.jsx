function CreatePost() {
    const [content, setContent] = React.useState("");

    const handleSubmit = (event) => {
        event.preventDefault();
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
        <div class="uform">
            <div class="upload-form">
                <form onSubmit={handleSubmit}>  
                    <input   
                        type="text"   
                        value={content}   
                        onChange={handleChange}   
                        placeholder="What's on your mind?"  
                        style={{width: '100%'}} 
                    />
                    <br />
                    <br />
                    <button type="submit" class="btn btn-primary btn-lg btn-block">
                        Post                       
                    </button> 
                </form>  
            </div>
        </div>
    );
}

ReactDOM.render(<CreatePost />, document.getElementById('react-root'));