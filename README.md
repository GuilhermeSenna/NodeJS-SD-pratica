# Aluguel em dia
## Sistema para locação de imóveis automático.


> Pasta do template:
Rocker/vertical


---

# NodeJS-SD-pratica
 
### Programa utilizado para disciplina de SD (Sistemas distribuídos) sendo realizado um deploy no heroku.

## Link:  [Repositório oficial](https://github.com/profmathias/cet-100)

#
### Rotas presentes:
- Padrões: (index{'/'}, /hello, clientes, /pag1, /pag2, /pag3 )
- '/info', com métodos GET e PUT
- '/peers', com métodos GET e PUT
- '/peers/:id', com métodos GET, PUT e DELETE
- '/resolver'. com métodos GET {comentado}  e POST

### Checagens:
- Checa se o corpo da requisição está vazio
- Checa se há chaves sem valor (vazio)
- Checa se há chaves vazias
- Checa se a chave inserida é válida (Array com as chaves possíveis) - Case and Accent sensitive
- Checa se todas as chaves necessárias estão inseridas na requisição
- Checa se o usuário está tentando inserir um valor UNIQUE (ID e NOME) - Peers
- Checa se está buscando um usuário por ID inexistente

