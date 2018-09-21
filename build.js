var stealTools = require("steal-tools");
var fs = require("fs-extra");

stealTools
  .export({
    steal: {
      config: `${__dirname}/package.json!npm`
    },
    outputs: {
      "production+cjs": {
        removeDevelopmentCode: true,
        dest: `${__dirname}/dist/cjs`
      }
    }
  })
  .then(function() {
    return new Promise(function(resolve, reject) {
      fs.copy(
        "src/with-async-props.js",
        "dist/es6/with-async-props.js",
        function(err, data) {
          if (err) {
            reject(err);
          }
          resolve(data);
        }
      );
    });
  })
  .catch(function(e) {
    setTimeout(function() {
      throw e;
    }, 1);
  });
