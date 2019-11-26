var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Parth123",
    database: "bamazon"
});
connection.connect(function(err){
    if (err) throw err;
    startUp();
});

function startUp(){
    inquirer
    .prompt([
        {
            type:"list",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add new Product", "Exit"],
            message: "What would you like to do?",
            name: "action"
        }
    ]).then(function(resp){
        runTransaction(resp.action);
    });
};

function runTransaction(action){
    switch (action){
        case "View Products for Sale":
            showAll();
            break;
        case "View Low Inventory":
            showLow();
            break;
    };
};

function showAll(){
    var table = new Table({
        head: ["item_id", "item name", "department", "price", "stock"]
    });
    connection.query(
        "SELECT * FROM products", function(err, resp){
            if(err) throw err;
            createTable(resp, table);
            connection.end();
        }
    );
};

function showLow(){
    var table = new Table({
        head: ["item_id", "item name", "department", "price", "stock"]
    });
    connection.query(
        "SELECT * FROM products WHERE stock_qty < ?", [9], function(err, resp){
            if(err) throw err;
            if (resp == ""){
                console.log("\n No Stock Qtys below 5 \n");
            };
            createTable(resp, table);
            connection.end();
        }
    );
};

function addStock(){
    inquirer
    .prompt ([
        {
            type:"rawlist",
            choices: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            message: "Select item to add stock to",
            name: "addStockId"
        },
        {
            type: "number",
            message: "How much would you like to increase the stock by?",
            name: "stockAdd"
        }
    ]).then(function(answer){
        addStockId = answer.addStockId;
        addStockNum = answer.stockAdd;

    })
}

function createTable(object, table){
    object.forEach(element => {
        var tableRow = [element.item_id, element.product_name, element.department_name, element.price, element.stock_qty];
        table.push(tableRow)
    });
    console.log(table.toString());
};