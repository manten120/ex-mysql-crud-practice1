var express = require('express');
var router = express.Router();

var mysql = require('mysql');

require('dotenv').config();

// MySQLの設定情報
let mysql_setting = {
  host: process.env.MySQL_host,
  user: process.env.MySQL_user,
  password: process.env.MySQL_password,
  database: 'practice_db1',
};

/* GET home page. */
router.get('/', function(req, res, next) {
  const connection = mysql.createConnection(mysql_setting);
  connection.connect();
  connection.query('SELECT * from table1',
    function (error, results, fields) {
      if (error == null) {
        const data = {
          title: 'お品書き',
          menus: results,
        };
        res.render('index', data);
      }
       else {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('ERROR...CHECK CODE!');
      }
    }
  );
  connection.end();
});

/* POST Index page */
router.post('/', function(req, res, next) {
  const password = req.body.password;
  
  if (password == 'abab') {
    res.redirect('/database')
  }
  else {
    res.redirect('/')
  }
});



/* GET database page. */
router.get('/database', function(req, res, next) {
  const connection = mysql.createConnection(mysql_setting);
  connection.connect();
  connection.query('SELECT * from table1',
    function (error, results, fields) {
      if (error == null) {
        const data = {
          title: 'データベース',
          menus: results,
        };
        res.render('database', data);
      }
       else {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('ERROR...CHECK CODE!');
      }
    }
  );
  connection.end();
});




/* GET add menu page. */
router.get('/addmenu', function(req, res, next) {
  const data = {
    title: 'メニューを追加',
    validationMessage: '',
    form: {
      name: '',
      price: 0,
      info: '',
    }
  };
  res.render('addmenu', data);
});

/* POST add menu page. */
router.post('/addmenu', function(req, res, next) {
  req.check('name', '料理名を入力してください').notEmpty();
  req.check('price', '値段を入力してください').notEmpty();
  req.check('price', '値段を半角の数字で入力してください').isInt();
  req.check('price', '値段を半角の数字で入力してください').isHalfWidth();

  req.getValidationResult().then((result) => {
    if (!result.isEmpty()) {
      let vm = '<ul class="error">';
      let resultList = result.array();
      console.log(result);
      for(let i in resultList) {
        vm += `<li>${resultList[i].msg}</li>`
      }
      vm += '</ul>'
      const data = {
        title: 'メニューを追加',
        validationMessage: vm,
        form: req.body,
      }
      console.log(data);
      res.render('addmenu', data);
    } else {
      const name = req.body.name;
      const price = req.body.price;
      const info = req.body.info;
    
      const data = {
        'name': name,
        'price': price,
        'info': info,
      };
    
      const connection = mysql.createConnection(mysql_setting);
      connection.connect();
      connection.query('insert into table1 set ?', data,
        function (error, results, fields) {
          if (error == null) {
            res.redirect('/database')
          }
           else {
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end('ERROR...CHECK CODE!');
          }
        }
      );
      connection.end();
    }
  });
});




/* GET detail page. */
router.get('/detail', function(req, res, next) {
  const id = req.query.id;

  const connection = mysql.createConnection(mysql_setting);
  connection.connect();
  connection.query('SELECT * from table1 where id=?', id,
    function (error, results, fields) {
      if (error == null) {
        const data = {
          title: '詳細',
          menu: results[0],
        };
        res.render('detail', data);
      }
       else {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('ERROR...CHECK CODE!');
      }
    }
  );
  connection.end();
});




/* GET edit page. */
router.get('/edit', function(req, res, next) {
  const id = req.query.id;

  const connection = mysql.createConnection(mysql_setting);
  connection.connect();
  connection.query('SELECT * from table1 where id=?', id,
    function (error, results, fields) {
      if (error == null) {
        const data = {
          title: '編集',
          validationMessage: '',
          menu: results[0],
        };
        res.render('edit', data);
      }
       else {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('ERROR...CHECK CODE!');
      }
    }
  );
  connection.end();
});

/* POST edit page. */
router.post('/edit', function(req, res, next) {
  req.check('name', '料理名を入力してください').notEmpty();
  req.check('price', '値段を入力してください').notEmpty();
  req.check('price', '値段を半角の数字で入力してください').isInt();
  req.check('price', '値段を半角の数字で入力してください').isHalfWidth();
  // req.check('info', '料理名を入力してください').notEmpty();

  const id = req.body.id;
  const name = req.body.name;
  const price = req.body.price;
  const info = req.body.info;

  const menu = {
    'id': id,
    'name': name,
    'price': price,
    'info': info,
  };

  req.getValidationResult().then((result) => {
    if (!result.isEmpty()) {
      let vm = '<ul class="error">';
      let resultList = result.array();

      for(let i in resultList) {
        vm += `<li>${resultList[i].msg}</li>`
      }
      vm += '</ul>'
      const data = {
        title: 'メニューを追加',
        validationMessage: vm,
        menu: menu,
      }
      console.log(data);
      res.render('edit', data);

    } else {

      const data = {
        'name': name,
        'price': price,
        'info': info,
      };
    
      const connection = mysql.createConnection(mysql_setting);
      connection.connect();
      connection.query('update table1 set ? where id = ?', [data, id],
        function (error, results, fields) {
          if (error == null) {
            res.redirect('/database')
          }
           else {
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end('ERROR...CHECK CODE!');
          }
        }
      );
      connection.end();
    }
  });
});


/* POST delete */
router.post('/delete', function(req, res, next) {
  const id = req.body.id;

  const connection = mysql.createConnection(mysql_setting);
  connection.connect();
  connection.query('delete from table1 where id = ?', id,
    function (error, results, fields) {
      if (error == null) {
        res.redirect('/database')
      }
       else {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('ERROR...CHECK CODE!');
      }
    }
  );
  connection.end();
});

module.exports = router;
