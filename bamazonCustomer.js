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

var itemIdArray = [];

connection.connect(function(err){
    if (err) throw err;
    startUP();
});

function startUP(){
    var table = new Table({
        head: ["item_id", "item name", "department", "price", "stock"]
    });
    itemIdArray = [];
    connection.query(
        "SELECT products.item_id, products.product_name, products.price, products.stock_qty, departments.department FROM products INNER JOIN departments ON products.department_name = departments.item_id", function(err, resp){
            if(err) throw err;
            createTable(resp, table);
            userInput();
        }
    );
};

function userInput(){
    inquirer
    .prompt([
        {
            type: "list",
            message: "What would you like to do?",
            choices: ["Buy", "Exit"],
            name: "action"
        },
        {
            type: "rawlist",
            choices: itemIdArray,
            message: "Which Item would you like to buy (use item_id)?",
            name: "selected_id",
            when: function(response){
                return response.action == "Buy";
            }
        },
        {
            type: "number",
            message: "How many of that item would you like to buy?",
            name: "qty",
            when: function(response){
                return response.action == "Buy";
            }
        },
    ]).then(function(resp){
        if (resp.action == "Exit"){
        console.log("\nThank you for shopping, please come again!");
        connection.end();
        }
        else {
            transactionBuy(resp.selected_id, resp.qty);
        };
    });
};

function transactionBuy(id, qty){
    connection.query(
        "SELECT * FROM products WHERE item_id=?", [id], function(err, resp){
            if (err) throw err;
            var item_qty = resp[0].stock_qty;
            if (item_qty < qty){
                console.log("\nSorry, we only have " + item_qty + " in stock, please try again with a different qty");
                return userInput();
            };
            var item_name = resp[0].product_name;
            var price = resp[0].price;
            var total_cost = price * qty;
            var new_stock_qty = item_qty - qty;
            console.log("\nThank you for purchasing " + qty + " of " + item_name + ".")
            console.log("The total cost for your purchase today is: $" + total_cost +"\n");
            removeStock(id, new_stock_qty);
        }
    );
};

function removeStock(id, new_stock_qty){
    connection.query(
        "UPDATE products SET stock_qty = ? WHERE item_id = ?", [new_stock_qty, id], function(err, resp){
            if (err) throw err;
            startUP();
        }
    );
};

function createTable(object, table){
        object.forEach(element => {
            var tableRow = [element.item_id, element.product_name, element.department, element.price, element.stock_qty];
            table.push(tableRow)
            itemIdArray.push(element.item_id);
        });
        console.log(table.toString());
};