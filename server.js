const restify = require("restify");
const errors = require("restify-errors");

const server = restify.createServer( {
    name : "Lojinha" ,
    version : "1.0.0"
})

server.use( restify.plugins.acceptParser( server.acceptable ) )
server.use( restify.plugins.queryParser() )
server.use( restify.plugins.bodyParser() )

server.listen( 8001, function(){
    console.log( "%s executando em: %s" , server.name, server.url)
} )

var conn = require( "knex" )( {
    client : "mysql" ,
    connection : {
        host : "localhost" ,
        user : "root" ,
        password : "" ,
        database : "loja"
    }
} )

//Faz as 2 tables se elas não existem.

await conn.schema.createTableIfNotExists("produto", function (table) {
    table.increments("id");
    table.string("nome");
    table.decimal("preço");
})

await conn.schema.createTableIfNotExists("cliente", function (table) {
    table.increments("id");
    table.string("nome");
    table.string("CEP");
    table.string("CPF");
})

//Adiciona endpoints para controlar os produtos

server.get( "/produto" , (req, res, next) =>{ 
    conn( "produto" )
        .then(  (dados) =>{
            res.send( dados )
        } , next )  
 } )


 server.get( "/produto/:idProd" , (req, res, next) =>{ 
    id = req.params.idProd
    conn( "produto" )
        .where( "id" , id )
        .first()
        .then(  (dados) =>{
            res.send( dados )
        } , next )  
 } )

 server.post( "/produto" , (req, res, next) =>{ 
    conn( "produto" )
        .insert( req.body )
        .then(  (dados) =>{
            if( !dados ){
                return res.send( new errors.BadRequestError("Não foi possível inserir") )
            }
            res.send( dados )
        } , next )  
 } )

 server.del("/produto/:idProd", (req, res, next) => {
    const id = req.params.idProd
    conn("produto")
        .where("id", id)
        .delete()
        .then((dados) => {
            if (!dados) {
                return next(new errors.NotFoundError("Produto não encontrado"))
            }
            res.send(200, { success: true })
            return next()
        }, (err) => {
            return next(new errors.BadRequestError("Não foi possível excluir"))
        })
})

 server.put("/produto/:idProd", (req, res, next) => {
    const id = req.params.idProd
    conn("produto")
        .where("id", id)
        .update(req.body)
        .then((dados) => {
            if (!dados) {
                return next(new errors.NotFoundError("Produto não encontrado"))
            }
            res.send(200, { success: true })
            return next()
        }, (err) => {
            return next(new errors.BadRequestError("Não foi possível editar"))
        })
})

 //Adiciona endpoints para controlar os clientes, por ID e CPF

 server.get( "/cliente" , (req, res, next) =>{ 
    conn( "cliente" )
        .then(  (dados) =>{
            res.send( dados )
        } , next )  
 } )


server.get( "/cliente/:idCli" , (req, res, next) =>{ 
    id = req.params.idCli
    conn( "cliente" )
       .where( "id" , id )
       .first()
       .then(  (dados) =>{
           res.send( dados )
       } , next )  
} )

server.get( "/cliente/cpf/:cpfCli" , (req, res, next) =>{ 
    cpf = req.params.cpfCli
    conn( "cliente" )
       .where( "CPF" , cpf )
       .first()
       .then(  (dados) =>{
           res.send( dados )
       } , next )  
} )

server.post( "/cliente" , (req, res, next) =>{ 
    conn( "cliente" )
       .insert( req.body )
       .then(  (dados) =>{
           if( !dados ){
               return res.send( new errors.BadRequestError("Não foi possível inserir") )
           }
           res.send( dados )
       } , next )  
} )

server.del("/cliente/:idCli", (req, res, next) => {
   const id = req.params.idCli
   conn("cliente")
       .where("id", id)
       .delete()
       .then((dados) => {
           if (!dados) {
               return next(new errors.NotFoundError("Usuário não encontrado"))
           }
           res.send(200, { success: true })
           return next()
       }, (err) => {
           return next(new errors.BadRequestError("Não foi possível excluir"))
       })
})

server.del("/cliente/cpf/:cpfCli", (req, res, next) => {
   const cpf = req.params.cpfCli
   conn("cliente")
       .where("CPF", cpf)
       .delete()
       .then((dados) => {
           if (!dados) {
               return next(new errors.NotFoundError("Usuário não encontrado"))
           }
           res.send(200, { success: true })
           return next()
       }, (err) => {
           return next(new errors.BadRequestError("Não foi possível excluir"))
       })
})

server.put("/cliente/:idCli", (req, res, next) => {
   const id = req.params.idCli
   conn("cliente")
       .where("id", id)
       .update(req.body)
       .then((dados) => {
           if (!dados) {
               return next(new errors.NotFoundError("Usuário não encontrado"))
           }
           res.send(200, { success: true })
           return next()
       }, (err) => {
           return next(new errors.BadRequestError("Não foi possível editar"))
       })
})

server.put("/cliente/cpf/:cpfCli", (req, res, next) => {
   const cpf = req.params.cpfCli
   conn("cliente")
       .where("CPF", cpf)
       .update(req.body)
       .then((dados) => {
           if (!dados) {
               return next(new errors.NotFoundError("Usuário não encontrado"))
           }
           res.send(200, { success: true })
           return next()
       }, (err) => {
           return next(new errors.BadRequestError("Não foi possível editar"))
       })
})

//Finaliza fazendo o endpoint da pagina principal que só tem http get.
server.get( "/" , (req, res, next) =>{ 
    //res.setHeader( 'Content-type' , 'application/json')
    res.send( { "resposta" : "Sejam bem-vindos à nossa Lojinha" } )
 } )