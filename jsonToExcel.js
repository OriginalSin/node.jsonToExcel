var fetch = require('node-fetch'),
	fs = require('fs'),
	json2xls = require('json2xls'),
	prefix = 'http://api.comagic.ru/api/',
	par = process.argv.reduce(function(p, c, ind) {
		var arr = c.split('=');
		if (arr.length > 1) {
			p[arr[0]] = arr[1];
		}
		return p;
	}, {});
// debugger;	// раскоментарить для отладки

	var login = par.login || '',
		pass = par.pass || par.password || '',
		session,
		postfix = '&accept=application/json',
		url = prefix + 'login/?login=' + login + '&password=' + pass + postfix;

	fetch(url).then(function(response) {
		return response.json();
	}).then(function(json) {
		if (json.success) {
			var url = prefix + 'v1/call/?session_key=' + json.data.session_key,
				d1 = par.d1 || '2017-04-17 00:00:00',
				d2 = par.d2 || '2017-04-18 00:00:00';

			url += '&date_from=' + d1 + '&date_till=' + d2 + postfix;
			fetch(url).then(function(response) {
				return response.json();
			}).then(function(json) {
 console.log('response: ', json.data.length);
				fs.writeFileSync('res.json', JSON.stringify(json.data, null, 2));
				var arr = json.data.map(function(it) { // для вывода в Excel офильтровываем массивы и Boolean 
					var res = {};
					for (var key in it) {
						var type = typeof it[key];
						if (type === 'string' || type === 'number') {
							res[key] = it[key];
						}
					}
					return res;
				});
				fs.writeFileSync('res.xlsx', json2xls(arr), 'binary');
			});
		} else {
			console.log('Error: ', json.message);
		}
	});
/*
https://www.youtube.com/watch?v=COHIRHitRdc  Отладка скриптов под Node.JS 

node jsonToExcel.js login=serg@test.ru pass=123 d1=2017-04-17 d2=2017-04-18

*/