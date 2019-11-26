var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Parth123",
    database: "bamazon"
});

connection.connect(function(err){
    if (err) throw err;
    startUP();
});

function startUP(){
    connection.query(
        "SELECT * FROM products", function(err, resp){
            if(err) throw err;
            // console.log(resp)
            console.table(resp);
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
            type: "number",
            message: "Which Item would you like to buy (use item_id)?",
            name: "selected_id",
            when: function(response){
                console.log(response.action);
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
        console.log("Thank you for shopping, please come again!");
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
                console.log("Sorry, we only have " + item_qty + "in stock, please try again with a different qty");
                return userInput();
            };
            var item_name = resp[0].product_name;
            var price = resp[0].price;
            var total_cost = price * qty;
            var new_stock_qty = item_qty - qty;
            console.log("Thank you for purchasing " + qty + " of " + item_name + ".")
            console.log("You will pay: $" + total_cost);
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