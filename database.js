import mysql from 'mysql';
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'qr_game'
});

connection.connect(function (err) {
  if (err) 
  throw err;
  console.log("Connected!");
});

export function insert(sql) {
  // var sql = "INSERT INTO customers (name, address) VALUES ('Company Inc', 'Highway 37')";
  connection.query(sql, function (err, result) {
    if (err) throw err;
    console.log("1 record inserted");
  });
}

export function select(sql) {
  return new Promise(resolve => {
    connection.query(sql, function (err, result, fields) {//"SELECT * FROM customers"
      if (err) throw err;
      // console.log(result);
      resolve(result);
    });
  });
}

export function update(sql) {
  connection.query(sql, function (err, result) {
    if (err) throw err;
    console.log("1 record updated");
  });
}