 const cds = require("@sap/cds");
module.exports = cds;

if(process.env.NODE_ENV !== "production"){
    const cds_swagger = require("cds-swagger-ui-express")
    cds.on('bootstrap', app => app.use(cds_swagger()))
}
