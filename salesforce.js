/**
 * Salesforce connection library constructor.
 */
function Salesforce(username, password, token, wsdl) {

    //Required NodeJS libraries
    this.q = require("q");
    this.soap = require("soap");

    //Salesforce access data
    this.username = username;
    this.password = password;
    this.token = token;
    this.wsdl = wsdl || "./node_modules/soap_salesforce/wsdl/enterprise.xml";

    //Other properties
    this.promise; //A promise will be used for returning soapClient after finishing Salesforce login
    this.soapClient; //Salesforce SOAP client instance will be stored here
};

/**
 * Initialize Salesforce's login process.
 */
Salesforce.prototype.Login = function() {
    //Initializing of this.promise
    this.promise = this.q.defer();

    //We're going to create our SOAP client
    this.soap.createClient(this.wsdl, this.OnSoapClient.bind(this));

    return this.promise.promise;
};

/**
 * This method will be executed after creating soapClient using soap NodeJS library.
 * @param {Object} error
 * @param {Object} client
 */
Salesforce.prototype.OnSoapClient = function(error, client) {
    //An error has ocurred
    if (error || !client) {
        this.promise.reject(error);
    }
    //If everything went ok, we're gonna to login to Salesforce through soapClient
    else {
        this.soapClient = client;
        client.login({username: this.username,password: this.password+""+this.token},this.OnLogin.bind(this));
    }
};

/**
 * After a successfully Salesforce login, this method will be set endpoint and another required configuration.
 * @param {Object} error
 * @param {Object} result
 */
Salesforce.prototype.OnLogin = function(error, result) {
    //A wild error appears
    if(error || !result || !result.result || !result.result.serverUrl || !result.result.sessionId) {
        this.promise.reject(error);
    }
    else {
        //Configure endpoint and others parameters
        this.soapClient.setEndpoint(result.result.serverUrl);
        var sheader = {SessionHeader:{sessionId: result.result.sessionId}};
        this.soapClient.addSoapHeader(sheader,"","tns","urn:enterprise.soap.sforce.com");

        //Awesome, everything went ok, now we can resolve the promise (passing soapClient as a callback parameter)
        this.promise.resolve(this.soapClient);
    }
};

/**
 * Parse an object's parameters into an sObject formatted object.
 * @param {Object} fields An Object where its properties will be the object's fields.
 * @param {String} type Object API name.
 * @returns {Object}
 */
Salesforce.prototype.FormatObject = function(fields,type){
    var sObjectFormatted = fields;
    sObjectFormatted.attributes = {
        xsi_type:{
            type:type
        }
    };
    return sObjectFormatted;
};

/**
 * Parse a string to an object ready to be used in queryAll Salesforce's API method.
 * @param {string} query
 * @returns {{queryString: *}}
 */
Salesforce.prototype.FormatQuery = function(query){
    var queryFormatted = {
        queryString: query
    };

    return queryFormatted;
};

/**
 * Escapes an string passing through field parameter.
 * @param {String} field
 * @returns {String}
 */
Salesforce.prototype.EscapeSOQL = function(field) {
    //TODO: It's a little rudimentary. Maybe other options will be better than replace method.
    //Escape newline and others
    field = field.replace('\\n','');
    field = field.replace('\\r','');
    field = field.replace('\\t','');
    field = field.replace('\\b','');
    field = field.replace('\\f','');
    //Escape in capital letters too.
    field = field.replace('\\N','');
    field = field.replace('\\R','');
    field = field.replace('\\T','');
    field = field.replace('\\B','');
    field = field.replace('\\F','');
    //Escape \
    field = field.replace('\\','\\\\');
    //Escape '
    field = field.replace("'","\'");
    //Escape "
    field = field.replace('"','\"');
    //Escape _
    field = field.replace("_","\_");
    //Escape %
    field = field.replace("%","\%");
    return field;
};

module.exports = Salesforce;