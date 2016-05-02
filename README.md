## Synopsis

soap_salesforce is a library that facilitates login into Salesforce SOAP API, and provide basic functionality for calling most used Salesforce API methods.
Specifically it is designed to be used with an Enterprise WSDL, but it can be easily adapted in order to use other kind of Salesforce WSDL files.

Short "how to use" guide is available ([here](https://www.oriol.im/how-to-consume-salesforce-soap-service-with-nodejs/)).

## Code Example

### Initializing and querying Salesforce

```javascript
//We will require soap_salesforce in order to call Salesforce SOAP API.
var salesforce = require("soap_salesforce");
//Create an instance of soap_salesforce.
var salesforceAPI = new salesforce("username","password","token","enterprise wsdl xml path");
//Now, login to the API, it will return us a promise. 
salesforceAPI.Login().then(function(soapClient){ //If everything goes ok we will recieve a soapClient object.
    var query = salesforceAPI.FormatQuery("SELECT Id FROM Account LIMIT 1"); //This method will format a string into a object ready for be used in a queryAll call
    soapClient.queryAll(query, function(error, result){ //After executing queryAll method it will pass error and result variables to a callback function.
        console.log(result); //This is what Salesforce returned us :)
    });
});
```

### Using helper methods

soap_salesforce provide two useful methods in addition to the methods we have already seen:
One for escaping characters in a SOQL sentence, and other for formatting a javascript object in order to pass it as a parameter when creating or editing Salesforce records.

#### Escaping SOQL parameters

```javascript
var accountName = "Escape ' me % please _"; //Unescaped parameter
accountName = salesforceAPI.EscapeSOQL(accountName); //Escaped parameter.
var query = salesforceAPI.FormatQuery("SELECT Id FROM Account WHERE Name = '"+accountName+"' LIMIT 1"); 
soapClient.queryAll(query, function(error, result){ 
    console.log(result); 
});
```

#### Creating or editing a record

```javascript
//Define new account data
var newAccount = {
    Name: "Fake account",
    Description__c: "Another field here :)"
 };
//Format it into an sObject
var newAccount = salesforceAPI.FormatObject(newAccount, "Account");

//Now we can create the record
soapClient.create({sObjects: [newAccount]}, function(error, result){
    console.log(result); //Result will be here, and the Id of the account we've just created.
});
```

## Installation

NPM is required for installing this library. 
In order to install, open a terminal, place in your project's folder, and type `npm install soap_salesforce`.

## Contributors

* Oriol Egea ([@OriolEgea](http://twitter.com/OriolEgea))

## License

Released under AGPL-V3.