function seta(){
    var a = document.getElementById('bottom')
    var nav = document.getElementById('mobile-redesocial')

    if(a.style.color === 'white'){
        a.style.color='red'
        nav.style.display='flex'
    } else{
        a.style.color='white'
        nav.style.display='none'
    }
}