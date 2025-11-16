function tabuada(){
    /*Começar sempre trazendo os id e outros que vão ser usados*/
    let num = document.getElementById('txtn')
    let tab = document.getElementById('seltab')
    /*Depois a condição de erro*/
    if (num.value.length == 0){
        window.alert('ERRO - escolha um número ao menos!')
    } else { //senão der erro o programa continua
        //aqui e adicionado os números
        let n = Number(num.value)
        let c = 1
        tab.innerHTML = ''
        while (c <= 10) { /*While e uma função de repetição tambem chamada de enquanto. Que ira se repetir até que a ação necessaria seja concluida*/
        /* Após e adicionado uma nova váriavel que cria uma option dentro do select no HTML, dentro dela e adicionado um texto com determinados números que vão aparecendo com as condições e por fim e adicionado mais um ao C enquanto ele não chega ate o numero 10 */
            let item = document.createElement('option')
            item.text = `${n} X ${c}= ${n*c}`
            item.value = `tab${c}`
            tab.appendChild(item)
            c++
        }
    }
    
}