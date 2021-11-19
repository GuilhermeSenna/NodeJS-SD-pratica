# NodeJS-SD-pratica
 
### Programa utilizado para disciplina de SD (Sistemas distribuídos) sendo realizado um deploy no heroku.

## Link:  [Repositório oficial](https://github.com/profmathias/cet-100)

### Rotas presentes:
- Padrões: ('/', '/hello', '/clientes', '/pag1', '/pag2', '/pag3')
- '/info', com métodos GET e PUT
- '/peers', com métodos GET e POST
- '/peers/:id', com métodos GET, PUT e DELETE
- '/recurso', com métodos GET, POST, PUT e DELETE
- '/resolver', com métodos GET {comentado} e POST
- '/coordenador', com método GET
- '/eleicao', com método GET e POST
- '/eleicao/:id', com método POST
- '/reset', retorna o conteúdo do peers e info para o padrão

### Checagens:
- Checa se o corpo da requisição está vazio
- Checa se há chaves com valor vazio
- Checa se há chaves vazias
- Checa se a chave inserida é válida (Array com as chaves possíveis) - Case and Accent sensitive
- Checa se todas as chaves necessárias estão inseridas na requisição
- Checa se o usuário está tentando inserir um valor UNIQUE (ID e NOME) - Peers
- Checa se está buscando um usuário por ID inexistente

### Funcionalidades:
- Implementação de múltiplas requisições externas e outros métodos assíncronos.
- Armazenamento de logs dos procedimentos realizados durante uma eleição. ([Logs online](https://sd-log-server.herokuapp.com/log) {não criado por mim}) 
- Permite alterar só o que foi passado (Aonde não há chaves necessárias, como no método PUT)
- Ao editar um peer, checa se o novo ID/nome já não está sendo usado por outro usuário (Porém, permite alterar informações UNIQUE se estiver manipulando um objeto que contenha o mesmo ID do passado por requisição)
- Códigos de resposta HTTP usados:
- - 200 (OK)
- - 400 (BAD REQUEST)
- - 401 (ACCESS DENIED)
- - 404 (NOT FOUND)
- - 409 (CONFLICT)
- - 410 (GONE)
