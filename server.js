const app = require("./app");
const mongoose = require("mongoose");
const port = 9001;
const util = require("./util/utilites");

mongoose
  .connect(util.dbConnectionString)
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.log("Server error - " + err);
  });
