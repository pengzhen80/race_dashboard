var db = require("../clients/db.sqlites")

//export createUser function
module.exports.createUser = function createUser(newUser) {
    return new Promise(function (resolve, reject) {
        Promise.all([searchUser(newUser['email'])])
            .then(
                values => {
                    if (values[0] > 0) {
                        console.log('email already registered');
                        // return 'email already registered';
                        resolve('email already registered');
                    }
                    else {
                        Promise.all([sql_createUser(newUser)]).then(values => {
                            if(values[0] == null)
                            {
                                // return 'success';
                                resolve('success');
                            }
                        })
                    }
                }
            )
    });
}

function sql_createUser(newUser) {

    var sql = 'INSERT INTO user (name, email, password) VALUES (?,?,?)'
    var params = [newUser['name'], newUser['email'], newUser['password']];

    return new Promise(function (resolve, reject) {
        db.run(sql, params, (err) => {
            console.log(err);
            resolve(err);
        });
    });

};

var searchUser = function (email) {
    var sql = "select count(*) from user where email = ?"
    var params = [email];
    return new Promise(function (resolve, reject) {
        db.all(sql, params, (err, rows) => {
            resolve(rows[0]['count(*)']);
        });
    });
}

module.exports.validateUser = function (user) {
    return new Promise(function (resolve, reject) {
        Promise.all([searchUser(user['email'])])
        .then(
            values => {
                if (values[0] == 0) {
                    console.log('no such email');
                    // return 'email already registered';
                    resolve('no such email');
                }
                else {
                    var sql = "select * from user where email = ? and password = ?";
                    var params = [user['email'], user['password']];
                    db.all(sql, params, (err, rows) => {
                        if(rows.length>0)
                        {
                            resolve('logIn success');
                        }
                        else
                        {
                            resolve('wrong password');
                        }
                    });
                }
            }
        )
    });
}