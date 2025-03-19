function seta(){
    var a = document.getElementById('bottom')
    var nav = document.getElementById('mobile-redesocial')

    if(a.style.color === 'rgb(137, 137, 137)'){
        a.style.color='rgb(131, 0, 0)'
        nav.style.display='flex'
    } else{
        a.style.color='rgb(137, 137, 137)'
        nav.style.display='none'
    }
}