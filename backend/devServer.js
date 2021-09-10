Object.assign(process.env, require('./test-env.json'));
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 8020;

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    res.end();
  } else {
    next();
  }
});

// const makeLambda = modulePath => {
//   const { handler } = require(modulePath);
//   return async (req, res) => {
//     const event = {
//       version: '2.0',
//       rawQueryString: req._parsedUrl.search?.slice(1),
//       pathParameters: req.params,
//       body: req.body && JSON.stringify(req.body),
//     };
//     try {
//       const response = await handler(event);
//       if (response && 'statusCode' in response) {
//         return res.status(response.statusCode).json(JSON.parse(response.body || '{}'));
//       }
//       res.status(200).json(response);
//     } catch (err) {
//       res.status(500).json({ message: 'DevServer error: ' + err.message });
//     }
//   }
// }

// app.route('/recipes')
//   .get(makeLambda('./src/getRecipes'))
//   .post(makeLambda('./src/createRecipe'));

// app.route('/recipes/:id')
//   .get(makeLambda('./src/getRecipe'))
//   .put(makeLambda('./src/editRecipe'));

app.route('/test-invocations')
  .post(async (req, res) => {
    const { name, body } = req.body;
    try {
      const response = await require(`./src/${name}`).handler(body);
      res.json(response);
    } catch (err) {
      res.status(err.statusCode || 500).json({});
    }
  });

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`)
});
