function run(){
/*Começo puxando os números que vão ser digitados no HTML para o Js*/
    var numi = window.document.getElementById('numb1')
    var numf = window.document.getElementById('numb2')
    var passo = window.document.getElementById('passo')
    var con = window.document.getElementById('con')
/*Criado a variável que diz que se um número não for digitado o programa não roda*/
    if(numi.value.length == 0 || numf.value.length == 0 || passo.value.length == 0){
        con.innerHTML = 'impossivel contar'
    } else {
//Inicia a contagem e transformando em variaveis em números  
        con.innerHTML='contando...'
        var i = Number(numi.value)
        var f = Number(numf.value)
        var p = Number(passo.value)
/*Exibindo um alerta se p for 0 ele vai passar a ter valor 1*/
        if(p <=0){ 
            window.alert('Passo invalido considerando passo 1')
            p = 1
        }
//Iniciando a contagem 
        if (i < f){
/*CONTAGEM CRESCENTE levando em conta número inicial menor que número final*/
            for(var c = i; c<=f ; c+= p){
            con.innerHTML +=`\u{1F449} ${c} ` /*\u Para adicionar emoji*/    
            } 
        }
        else{
/*CONTAGEM DECRESCENTE levando em conta número inicial maior que número final*/
            for(let c = i ; c>=f ; c -=p ){
                con.innerHTML += `\u{1f449} ${c} ` 
            }
        }
        con.innerHTML += `\u{1f3c1}`
        }
}