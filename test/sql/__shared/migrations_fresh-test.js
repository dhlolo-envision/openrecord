var should = require('should');
var Store = require('../../../lib/store');


module.exports = function(title, beforeFn, afterFn, store_conf){
  
  describe(title + ': Migrations Fresh', function(){
    var store;
  
    before(beforeFn);
    after(function(next){
      afterFn(next, store);
    });
  
    before(function(){
      store_conf.migrations = __dirname + '/../../fixtures/migrations/*';
      
      store = new Store(store_conf);
      store.setMaxListeners(0);
      
      store.Model('User', function(){});
      store.Model('Post', function(){});
      store.Model('AttributeTest', function(){});
    });
    
    
    
    
    it('are finished before ready() gets called', function(next){
      store.ready(function(){
        var User = store.Model('User');
        should.exist(User);
        next();
      });
    });
    
    
    it('has all attributes loaded', function(next){
      store.ready(function(){
        var User = store.Model('User');
        User.definition.attributes.should.have.property('id');
        User.definition.attributes.should.have.property('login');
        User.definition.attributes.should.have.property('first_name');
        next();
      });
    });
    
    
    it('has a primary key', function(next){
      store.ready(function(){
        var User = store.Model('User');
        User.definition.primary_keys.length.should.be.equal(1);
        User.definition.primary_keys.should.be.eql(['id']);
        next();
      });
    });
    
    
    it('has not_null definition', function(next){
      store.ready(function(){
        var User = store.Model('User');
        
        User.definition.attributes.id.notnull.should.be.true;
        User.definition.attributes.login.notnull.should.be.true;
        User.definition.attributes.first_name.notnull.should.be.false;
        
        next();
      });
    });
    
    
    it('second migrations was executed as well', function(next){
      store.ready(function(){
        var Post = store.Model('Post');
        
        Post.definition.attributes.should.have.property('id');
        Post.definition.attributes.should.have.property('message');
        
        next();
      });
    });
    
    
    
    it('has the right data type', function(next){
      store.ready(function(){
        var AttributeTest = store.Model('AttributeTest');
        if(store.type == 'postgres'){
          AttributeTest.definition.attributes.string_attr.type.name.should.be.equal('string');
          AttributeTest.definition.attributes.text_attr.type.name.should.be.equal('string');
          AttributeTest.definition.attributes.integer_attr.type.name.should.be.equal('integer');
          AttributeTest.definition.attributes.float_attr.type.name.should.be.equal('float');
          AttributeTest.definition.attributes.boolean_attr.type.name.should.be.equal('boolean');
          AttributeTest.definition.attributes.binary_attr.type.name.should.be.equal('buffer'); //SHOULD BY binary...
          AttributeTest.definition.attributes.date_attr.type.name.should.be.equal('date');
          AttributeTest.definition.attributes.datetime_attr.type.name.should.be.equal('datetime');
          AttributeTest.definition.attributes.time_attr.type.name.should.be.equal('time');
        }else{
          AttributeTest.definition.attributes.string_attr.type.name.should.be.equal('text');
          AttributeTest.definition.attributes.text_attr.type.name.should.be.equal('text');
          AttributeTest.definition.attributes.integer_attr.type.name.should.be.equal('integer');
          AttributeTest.definition.attributes.float_attr.type.name.should.be.equal('real'); //SHOULD BE float
          AttributeTest.definition.attributes.boolean_attr.type.name.should.be.equal('integer'); //SHOULD BE boolean
          AttributeTest.definition.attributes.binary_attr.type.name.should.be.equal('text'); //SHOULD BE binary
          AttributeTest.definition.attributes.date_attr.type.name.should.be.equal('date');
          AttributeTest.definition.attributes.datetime_attr.type.name.should.be.equal('datetime');
          AttributeTest.definition.attributes.time_attr.type.name.should.be.equal('text'); //SHOULD BE time
        }        
        
        next();
      });
    });
    
  });
};