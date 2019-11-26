DROP DATABASE IF EXISTS bamazon;
CREATE DATABASE bamazon;

ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Parth123';

USE bamazon;

CREATE TABLE products (
item_id INT NOT NULL AUTO_INCREMENT,
product_name CHAR(30),
department_name INT,
price DECIMAL(13,2),
stock_qty INT,
PRIMARY KEY (item_id)
);

INSERT INTO products (product_name, department_name, price, stock_qty)
VALUES
	("head phones", 1, 100.00, 10),
    ("hammer", 2, 5.00, 10),
    ("coconut water", 3, 1.00, 10),
    ("Mac Book pro", 1, 1000.00, 10),
    ("jacket", 4, 50.00, 10),
    ("shoes", 4, 35.00, 10),
    ("chair", 5, 75.00, 10),
    ("Stranger Things Season 1 - DVD", 6, 10.00, 10),
    ("Kit Kat", 3, 1.00, 10),
    ("banana", 3, 0.25, 10);

SELECT * FROM products WHERE stock_qty < 9;