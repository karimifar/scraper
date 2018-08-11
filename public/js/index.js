$("#scrape-btn").on("click", function(event){
    event.preventDefault();
    $.get("/scrape", function(res){
        console.log(res)
    }).then(function(){
        window.location.href = "/articles";
    })
    
})