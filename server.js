const { default: knex } = require("knex");
const sqlite3 = require("sqlite3").verbose();
const restify = require("restify");
const errors = require("restify-errors");

const server = restify.createServer( {
    name : "Lojinha" ,
    version : "1.0.0"
})

server.use( restify.plugins.acceptParser( server.acceptable ) )
server.use( restify.plugins.queryParser() )
server.use( restify.plugins.bodyParser() )

server.listen( 2003, function(){
    console.log( "%s executando em: %s" , server.name, server.url)
} )

const db = new sqlite3.Database("./loja.db", sqlite3.OPEN_READWRITE, (err) => {
    if(err) return console.error(err.message);

    console.log("Connection successful");
});

try
{
    db.run("CREATE TABLE IF NOT EXISTS produto(id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, nome varchar(128) NOT NULL, preço decimal(10,2) NOT NULL)")
    db.run("CREATE TABLE IF NOT EXISTS cliente(id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, nome varchar(128) NOT NULL, CEP varchar(8) NOT NULL, CPF varchar(11) UNIQUE NOT NULL)");
}
catch(err)
{
    console.log(err);
}

//db.close();

/*conn.schema.createTable("produto", function (table) {
        table.increments("id");
        table.string("nome");
        table.decimal("preço");
    })

conn.schema.createTable("cliente", function (table) {
    table.increments("id");
    table.string("nome");
    table.string("CEP");
    table.string("CPF");
})*/

server.get( "/produto" , (req, res, next) =>{
    db.all("SELECT * FROM produto", [], (err, rows) => {
        res.send(rows);
        next();
    })
    //res.send(db.all("SELECT * FROM produto"))
 } )


 server.get( "/produto/:idProd" , (req, res, next) =>{ 
    id = req.params.idProd
    db.get("SELECT * FROM produto where id = ?", [id], (err, row) =>
    {
        if(err)
        {
            res.send(err);
        }
        else
        {
            res.send(row);
        }
        next();
    })
 } )

 server.post( "/produto" , (req, res, next) => {
    try
    {
        var body = req.body;
        var req_args = [body.nome, body.preço]

        for(elem of req_args)
        {
            if(elem != undefined)
                continue;

            res.send(new errors.BadRequestError("Bad request."));
            next();
            return;
        }

        db.run("INSERT INTO produto (nome, preço) VALUES (?, ?)", req_args, (result, err) => {
            if(err)
            {
                res.send(err);
            }
            else
            {
                res.send("Elemento com o nome " + req_args[0] + " criado.");
            }
            next();
        });
    }
    catch
    {
        console.log(nome + " " + preço);
        console.log(new errors.BadRequestError("Não foi possivel inserir."));
    }
 } )

 server.del("/produto/:idProd", (req, res, next) => {
    const id = req.params.idProd

    db.run("DELETE FROM produto WHERE id=?", [id], (result, err) => {
    if(err)
    {
        res.send(err)
    }
    else
    {
        res.send("Request para deletar o elemento com o id " + id + " foi processado com sucesso.");
    }
    next();
    });
})

 server.put("/produto/:idProd", (req, res, next) =>{

    var sql = "UPDATE produto SET ";

    var first = true;

    for(const [key, value] of Object.entries(req.body))
    {
        if(!first)
            sql += ", ";
        first = false;

        if(value instanceof String || typeof value === "string")
        {
            sql += key + " = \'" + value + "\'";
        }
        else
        {
            sql += key + " = " + value;
        }
    }

    if(first)
    {
        res.send(errors.BadRequestError("Nenhum argumento no header?"));
        next();
        return;
    }

    const id = req.params.idProd
    sql += " WHERE id=" + id;

    console.log(sql);

    db.run(sql, [], (result, err) => {
        if(err)
        {
            res.send("Request para atualizar o elemento com o id " + id + " foi processado com sucesso.");
        }
        else
        {
            res.send(err);
        }
        next();
    });
})

 //Adiciona endpoints para controlar os clientes, por ID e CPF

server.get( "/cliente" , (req, res, next) =>{
    db.all("SELECT * FROM cliente", [], (err, rows) => {
        res.send(rows);
        next();
    })
 } )


 server.get( "/cliente/:idCli" , (req, res, next) =>{ 
    id = req.params.idCli
    db.get("SELECT * FROM cliente where id = ?", [id], (err, row) =>
    {
        if(err)
        {
            res.send(err);
        }
        else
        {
            res.send(row);
        }
        next();
    })
 } )

server.get( "/cliente/cpf/:cpfCli" , (req, res, next) =>{ 
    cpf = req.params.cpfCli
    db.get("SELECT * FROM cliente where CPF = ?", [cpf], (err, row) =>
    {
        if(err)
        {
            res.send(err);
        }
        else
        {
            res.send(row);
        }
        next();
    })
} )

 server.post( "/cliente" , (req, res, next) => {
    try
    {
        var body = req.body;
        var req_args = [body.nome, body.CEP, body.CPF]

        for(elem of req_args)
        {
            if(elem != undefined)
                continue;

            res.send(new errors.BadRequestError("Bad request."));
            next();
            return;
        }

        db.run("INSERT INTO cliente (nome, CEP, CPF) VALUES (?, ?, ?)", req_args, (result, err) => {
            if(err)
            {
                res.send(err);
            }
            else
            {
                res.send("Elemento com o nome " + req_args[0] + " criado.");
            }
            next();
        });
    }
    catch
    {
        console.log(nome + " " + preço);
        console.log(new errors.BadRequestError("Não foi possivel inserir."));
    }
 } )

 server.del("/cliente/:idCli", (req, res, next) => {
    const id = req.params.idCli

    db.run("DELETE FROM cliente WHERE id=?", [id], (result, err) => {
    if(err)
    {
        res.send(err)
    }
    else
    {
        res.send("Request para deletar o elemento com o id " + id + " foi processado com sucesso.");
    }
    next();
    });
})

server.del("/cliente/cpf/:cpfCli", (req, res, next) => {
    const cpf = req.params.cpfCli

    db.run("DELETE FROM cliente WHERE CPF=?", [cpf], (result, err) => {
    if(err)
    {
        res.send(err)
    }
    else
    {
        res.send("Request para deletar o elemento com o CPF " + cpf + " foi processado com sucesso.");
    }
    next();
    });
})

 server.put("/cliente/:idCli", (req, res, next) =>{

    var sql = "UPDATE cliente SET ";

    var first = true;

    for(const [key, value] of Object.entries(req.body))
    {
        if(!first)
            sql += ", ";
        first = false;

        if(value instanceof String || typeof value === "string")
        {
            sql += key + " = \'" + value + "\'";
        }
        else
        {
            sql += key + " = " + value;
        }
    }

    if(first)
    {
        res.send(errors.BadRequestError("Nenhum argumento no header?"));
        next();
        return;
    }

    const id = req.params.idCli
    sql += " WHERE id=" + id;

    console.log(sql);

    db.run(sql, [], (result, err) => {
        if(err)
        {
            res.send("Request para atualizar o elemento com o id " + id + " foi processado com sucesso.");
        }
        else
        {
            res.send(err);
        }
        next();
    });
})

server.put("/cliente/cpf/:cpfCli", (req, res, next) =>{

    var sql = "UPDATE cliente SET ";

    var first = true;

    for(const [key, value] of Object.entries(req.body))
    {
        if(!first)
            sql += ", ";
        first = false;

        if(value instanceof String || typeof value === "string")
        {
            sql += key + " = \'" + value + "\'";
        }
        else
        {
            sql += key + " = " + value;
        }
    }

    if(first)
    {
        res.send(errors.BadRequestError("Nenhum argumento no header?"));
        next();
        return;
    }

    const cpf = req.params.cpfCli
    sql += " WHERE CPF=" + cpf;

    console.log(sql);

    db.run(sql, [], (result, err) => {
        if(err)
        {
            res.send("Request para atualizar o elemento com o CPF " + cpf + " foi processado com sucesso.");
        }
        else
        {
            res.send(err);
        }
        next();
    });
})

//Finaliza fazendo o endpoint da pagina principal que só tem http get.
server.get( "/" , (req, res, next) =>{ 
    //res.setHeader( 'Content-type' , 'application/json')
    res.send( { "resposta" : "Sejam bem-vindos à nossa Lojinha" } )
 } )