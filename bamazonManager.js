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

connection.connect(function (err) {
    if (err) throw err;
    startUp();
});

function startUp() {
    var table = new Table({
        head: ["item_id", "item name", "department", "price", "stock"]
    });
    itemIdArray = [];
    inquirer
        .prompt([
            {
                type: "list",
                choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add new Product", "Exit"],
                message: "What would you like to do?",
                name: "action"
            }
        ]).then(function (resp) {
            runTransaction(resp.action);
        });
};

function runTransaction(action) {
    switch (action) {
        case "View Products for Sale":
            showAll();
            break;
        case "View Low Inventory":
            showLow();
            break;
        case "Add to Inventory":
            addStock();
            break;
        case "Add new Product":
            addNewProduct();
            break;
        case "Exit":
            connection.end()
            console.log("\nThank you and goodbye!\n")
            break;
    };
};

function showAll() {
    var table = new Table({
        head: ["item_id", "item name", "department", "price", "stock"]
    });
    connection.query(
        "SELECT products.item_id, products.product_name, products.price, products.stock_qty, departments.department FROM products INNER JOIN departments ON products.department_name = departments.item_id", function (err, resp) {
            if (err) throw err;
            createTable(resp, table);
            startUp();
        }
    );
};

function showLow() {
    var table = new Table({
        head: ["item_id", "item name", "department", "price", "stock"]
    });
    connection.query(
        "SELECT products.item_id, products.product_name, products.price, products.stock_qty, departments.department FROM products INNER JOIN departments ON products.department_name = departments.item_id WHERE stock_qty < ?", [5], function (err, resp) {
            if (err) throw err;
            if (resp == "") {
                console.log("\n No Stock Qtys below 5 \n");
            };
            createTable(resp, table);
            startUp();
        }
    );
};

function addStock() {
    var table = new Table({
        head: ["item_id", "item name", "department", "price", "stock"]
    });
    connection.query(
        "SELECT products.item_id, products.product_name, products.price, products.stock_qty, departments.department FROM products INNER JOIN departments ON products.department_name = departments.item_id", function (err, resp) {
            if (err) throw err;
            createTable(resp, table);
            inquirer
                .prompt([
                    {
                        type: "rawlist",
                        choices: itemIdArray,
                        message: "Select item to add stock to",
                        name: "addStockId"
                    },
                    {
                        type: "number",
                        message: "How much would you like to increase the stock by?",
                        name: "stockAdd"
                    }
                ]).then(function (answer) {
                    var addStockId = answer.addStockId;
                    var addStockNum = answer.stockAdd;
                    var currentStock = 0;
                    var newStock = 0;
                    var item_name = "";

                    connection.query(
                        "SELECT * FROM products WHERE item_id = ?", [addStockId], function (err, resp) {
                            if (err) throw err;
                            currentStock = resp[0].stock_qty;
                            item_name = resp[0].product_name;
                            newStock = currentStock + addStockNum;
                            connection.query(
                                "UPDATE products SET stock_qty = ? WHERE item_id = ?", [newStock, addStockId], function (err, resp) {
                                    if (err) throw err;
                                    if (resp.changedRows == 1) {
                                        console.log(item_name + " has a new stock of " + newStock);
                                    };
                                    startUp();
                                }
                            );
                        }
                    )
                });
        }
    );

};

function addNewProduct(){
    inquirer
    .prompt([
        {
            type:"input",
            message: "What is the name of the new item?",
            name: "productName"
        },
        {
            type: "number",
            message: "What is the department ID of the new item? (see department table)",
            name: "departmentID"
        },
        {
            type: "number",
            message: "What is the piece price of the new item?",
            name: "productPrice"
        },
        {
            type: "number",
            message: "What is the initial qty of the new item?",
            name: "startQty"
        }
    ]).then(function(resp){
        connection.query(
            "INSERT INTO products (product_name, department_name, price, stock_qty) VALUES (?, ? , ?, ?)", [resp.productName, resp.departmentID, resp.productPrice, resp.startQty], function(err, resp){
                if (err) throw err;
                console.log(resp);
                startUp();
            }
        );
        

    })
}

function createTable(object, table) {
    object.forEach(element => {
        var tableRow = [element.item_id, element.product_name, element.department, element.price, element.stock_qty];
        table.push(tableRow)
        itemIdArray.push(element.item_id);
    });
    console.log(table.toString());
};