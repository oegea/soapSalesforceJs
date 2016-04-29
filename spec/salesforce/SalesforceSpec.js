describe("Salesforce", function() {
  var salesforce = require('../../salesforce');
  var salesforceAPI;

  beforeEach(function() {
    //Instance Salesforce class
    salesforceAPI = new salesforce("fakeUsername","fakePassword","fakePassword","./fakeWSDL.xml");
    
    //Mock Login method
    spyOn(salesforceAPI, "Login").and.callFake(function(){
      //Initializing of promise
      var promise = {
        then: function(callback){
          //We're going to create our fake SOAP client
          var soapClient = {};
          callback(soapClient);
        } 
      };
      return promise;
    });
    
  });

  it("Should be able to login", function() {
    salesforceAPI.Login().then(function(soapClient){
      expect(typeof soapClient).toBe("object");
    });
    
  });
  
  
  it("Should be able to parse objects into sObjects", function(){
    salesforceAPI.Login().then(function(soapClient){
      //Define new account data 
      var newAccount = {
          Name: "Fake account",
          Description__c: "Another field here :)"
      };
      
      //Format it into an sObject 
      var newAccount = salesforceAPI.FormatObject(newAccount, "Account");
      
      //sObject should be a javascript object with "attributes" property
      expect(typeof newAccount).toBe("object");
      expect(newAccount.hasOwnProperty("attributes")).toBe(true)
      expect(typeof newAccount.attributes).toBe("object");
      expect(newAccount.attributes.hasOwnProperty("xsi_type")).toBe(true);
      expect(typeof newAccount.attributes.xsi_type).toBe("object");
      expect(newAccount.attributes.xsi_type.hasOwnProperty("type")).toBe(true);
      expect(typeof newAccount.attributes.xsi_type.type).toBe("string");
      expect(newAccount.attributes.xsi_type.type).toBe("Account");
      
      //sObject should have the initial object properties
      expect(newAccount.hasOwnProperty("Name")).toBe(true);
      expect(newAccount.hasOwnProperty("Description__c")).toBe(true);
      expect(typeof newAccount.Name).toBe("string");
      expect(typeof newAccount.Description__c).toBe("string");
      
    });
  });
  
  it("Should be able to escape a SOQL query", function() {
    salesforceAPI.Login().then(function(soapClient){
      
      var accountName = "Escape ' me % please _ \\"; //Unescaped parameter 
      accountName = salesforceAPI.EscapeSOQL(accountName);

      //accountName must be a string
      expect(typeof accountName).toBe("string");
      
      //The string has been escaped properly?
      expect(accountName).toBe("Escape \\' me \\% please \\_ \\\\");
      
    });
    
  });
  
  it("Should be able to format a string and use it as a Salesforce query", function(){
    salesforceAPI.Login().then(function(soapClient){
      
      var accountName = "Escape ' me % please _ \\"; //Unescaped parameter 
      accountName = salesforceAPI.EscapeSOQL(accountName);
      var query = "SELECT Id FROM Account WHERE Name = '"+accountName+"' LIMIT 1";
      
      var formatedQuery = salesforceAPI.FormatQuery(query); 

      expect(typeof formatedQuery).toBe("object");
      expect(formatedQuery.hasOwnProperty("queryString")).toBe(true);
      expect(typeof formatedQuery.queryString).toBe("string");
      expect(formatedQuery.queryString).toBe(query);

    });
  });



});
