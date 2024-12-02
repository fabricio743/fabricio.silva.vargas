<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>

<?php
$conexao = mysqli_connect( "localhost","root","fafa.FAFA123","amigos");


$nome = $_POST['nome'];
$data = $_POST['data'];
$estado = $_POST['est_nasc'];
$cidade = $_POST['cid_nasc'];

$sql = "INSERT INTO amigos.informaçoes (id, nome, data_nasc, estado, cidade) values(' ','$nome','$data'.'$estado','$cidade')";

$resultado =  mysqli_query($conexao,$sql);
?>
</body>
</html>