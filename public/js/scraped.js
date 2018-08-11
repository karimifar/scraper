$(".heart").on("click", function(){
    var save= {saved:true};
    var id = $(this).parent().parent().attr("data-id")
    console.log(id)

    if ($(this).attr("class")==="heart far fa-heart"){
        $(this).attr("class","heart fas fa-heart")
        save.saved= true;
    }else{
        $(this).attr("class","heart far fa-heart")
        save.saved=false;
    }

    $.post("/article/save/"+id, save, function(result){
        console.log(result)
    })
})

$(".note").on("click", function(){
    var theDiv = $(this).parent().parent()
    var id = theDiv.data("id");


    theDiv.children("div.note-div").attr("class","note-div visible" )
    
})


$(".form-group").on("click",".note-submit", function(e){
    e.preventDefault();
    $(this).text("Edit");
    $(this).attr("class", "btn btn-primary note-edit")
    $(this).parent().children("div.form-group").children("textarea").prop('disabled', function(i, v){ return !v; });
    var id= $(this).data("id")
    var note={
        body:$(this).parent().children("div.form-group").children("textarea").val().trim()
    } 
    console.log(note)
    $.post("/note/"+id, note, function(result){
        console.log(result)
    } )
})

$(".form-group").on("click",".note-edit", function(e){
    e.preventDefault();
    $(this).parent().children("div.form-group").children("textarea").prop('disabled', function(i, v){ return !v; });

    $(this).text("Submit");
    $(this).attr("class", "btn btn-primary note-submit")
})